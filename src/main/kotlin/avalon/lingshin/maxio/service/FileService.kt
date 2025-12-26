package avalon.lingshin.maxio.service

import avalon.lingshin.maxio.config.MaxioException
import avalon.lingshin.maxio.controller.FileDTO
import avalon.lingshin.maxio.entity.Bucket
import avalon.lingshin.maxio.entity.File
import avalon.lingshin.maxio.entity.Obj
import avalon.lingshin.maxio.entity.User
import avalon.lingshin.maxio.repository.BucketRepository
import avalon.lingshin.maxio.repository.FileRepository
import avalon.lingshin.maxio.repository.ObjRepository
import avalon.lingshin.maxio.repository.UserRepository
import org.jetbrains.annotations.NotNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import reactor.core.publisher.Mono
import java.nio.file.Files
import java.security.MessageDigest
import java.util.*

@Service
class FileService(
    private val objRepository: ObjRepository,
    private val fileRepository: FileRepository,
    private val userRepository: UserRepository,
    private val bucketRepository: BucketRepository,
    private val storage: LocalStorageEngine,
) {
    @Transactional(readOnly = true)
    fun getUser(user: String): User = userRepository.findByName(user).orElseThrow { NoSuchElementException("User $user not found") }

    @Transactional(readOnly = true)
    fun getBucket(
        user: Long,
        bucket: String,
    ): Bucket =
        bucketRepository
            .findByNameAndOwnerId(bucket, user)
            .orElseThrow {
                NoSuchElementException("Bucket $bucket owned by User $user not found")
            }

    @Transactional(readOnly = true)
    fun getFile(
        bucket: Long,
        file: String,
    ) = fileRepository.findByNameAndBucketId(file, bucket)

    @Transactional
    fun upload(
        uid: Long,
        user: String,
        bucket: String,
        file: FileDTO,
        offset: Long = 0,
    ): Mono<File> {
        val user = getUser(user)
        val bucket = getBucket(user.id, bucket)
        return storage.save(bucket, offset, file).then(
            Mono.fromCallable {
                getFile(bucket.id, file.name)
                    .orElseGet {
                        fileRepository.save(
                            File(
                                name = file.name,
                                bucket = bucket,
                                mimeType = file.type,
                                current = null,
                            ),
                        )
                    }.apply {
                        if (current?.hash != file.hash) {
                            current =
                                objRepository.save(
                                    Obj(
                                        file = this,
                                        hash = file.hash,
                                        parent = current,
                                        who = user,
                                    ),
                                )
                        }
                    }.let { fileRepository.save(it) }
            },
        )
    }
}
