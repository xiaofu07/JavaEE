package avalon.lingshin.maxio.service

import avalon.lingshin.maxio.controller.BucketDto
import avalon.lingshin.maxio.entity.Bucket
import avalon.lingshin.maxio.repository.BucketRepository
import avalon.lingshin.maxio.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class BucketService(
    private val bucketRepository: BucketRepository,
    private val userRepository: UserRepository,
    private val storage: LocalStorageEngine,
) {
    @Transactional
    fun createBucket(
        uid: Long,
        request: BucketDto,
    ) = bucketRepository
        .save(
            Bucket(
                name = request.name,
                description = request.description,
                owner =
                    userRepository
                        .findById(uid)
                        .orElseThrow { NoSuchElementException("User with id $uid not found") },
            ),
        ).also { storage.ensureBucketDir(it) }

    private fun getUserId(username: String) =
        userRepository
            .findByName(username)
            .orElseThrow {
                NoSuchElementException("User with name $username not found")
            }.id

    @Transactional
    fun getAllBucketOf(uid: Long) = bucketRepository.findAllByOwnerId(uid)

    @Transactional
    fun getBucketOf(
        userId: Long,
        bucketId: Long,
    ): Bucket =
        with(bucketRepository) {
            findById(bucketId)
                .orElseThrow { NoSuchElementException("Bucket with id $bucketId not found") }
                .also {
                    if (it.owner.id != userId) {
                        throw IllegalAccessException("Bucket $bucketId is not owned by user with id $userId")
                    }
                }
        }

    @Transactional
    fun deleteBucketOf(
        userId: Long,
        bucketId: Long,
    ) {
        with(bucketRepository) {
            findById(bucketId)
                .orElseThrow { NoSuchElementException("Bucket with id $bucketId not found") }
                .also {
                    if (it.owner.id != userId) {
                        throw IllegalAccessException("Bucket $bucketId is not owned by user with id $userId")
                    }
                    storage.deleteBucketDir(it)
                    delete(it)
                }
        }
    }
}
