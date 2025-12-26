package avalon.lingshin.maxio.service


import avalon.lingshin.maxio.config.MaxioException
import avalon.lingshin.maxio.config.StorageProperties
import avalon.lingshin.maxio.controller.FileDTO
import avalon.lingshin.maxio.entity.Bucket
import org.springframework.core.io.buffer.DataBuffer
import org.springframework.core.io.buffer.DataBufferUtils
import org.springframework.stereotype.Component
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import reactor.core.scheduler.Scheduler
import reactor.core.scheduler.Schedulers
import java.io.IOException
import java.nio.channels.AsynchronousFileChannel
import java.nio.file.*
import java.nio.file.attribute.BasicFileAttributes
import java.security.MessageDigest
import kotlin.io.path.deleteIfExists
import kotlin.io.path.relativeTo

@Component
class LocalStorageEngine(
    private val config: StorageProperties,
) {
    fun Bucket.dir(): Path = Paths.get(config.link, owner.name, name)

    fun <T : Any, R> Mono<T>.thenCallable(
        scheduler: Scheduler = Schedulers.boundedElastic(),
        block: () -> R,
    ) = this.then(
        Mono.fromCallable(block).subscribeOn(scheduler),
    )

    fun hashPath(hash: String): Path = Paths.get(config.real).resolve(hash)

    fun ensureBucketDir(bucket: Bucket): Path = Files.createDirectories(bucket.dir())

    fun deleteBucketDir(bucket: Bucket) {
        val dir = bucket.dir()
        if (!Files.exists(dir)) return
        Files.walkFileTree(
            dir,
            object : SimpleFileVisitor<Path>() {
                override fun visitFile(
                    file: Path,
                    attrs: BasicFileAttributes,
                ): FileVisitResult {
                    Files.deleteIfExists(file)
                    return FileVisitResult.CONTINUE
                }

                override fun postVisitDirectory(
                    dir: Path,
                    exc: IOException?,
                ): FileVisitResult {
                    Files.deleteIfExists(dir)
                    return FileVisitResult.CONTINUE
                }
            },
        )
    }

    private fun Path.checkSum(algorithm: String = "MD5") =
        MessageDigest
            .getInstance(algorithm)
            .also {
                Files.newInputStream(this).use { inputStream ->
                    val buffer = ByteArray(8192)
                    var bytes: Int
                    while (inputStream.read(buffer).also { bytes = it } != -1) {
                        it.update(buffer, 0, bytes)
                    }
                }
            }.digest()
            .joinToString("") { "%02x".format(it) }

    private fun FileDTO.path() = hashPath(hash)

    private fun FileDTO.finished() = with(path()) { Files.exists(this) && checkSum() == hash }

    private fun FileDTO.write(offset: Long) = writeFile(hashPath(hash), hash, offset, data)

    private fun FileDTO.linkTo(target: Path) = Files.createSymbolicLink(Files.createDirectories(target).resolve(name).apply{deleteIfExists()}, path().relativeTo(target))

    fun save(
        bucket: Bucket,
        offset: Long,
        file: FileDTO,
    ) = Mono
        .just(file)
        .flatMap {
            if (!it.finished()) it.write(offset) else Mono.empty()
        }.thenCallable {
            file.linkTo(bucket.dir())
        }

    fun writeFile(
        target: Path,
        hash: String,
        offset: Long,
        data: Flux<DataBuffer>,
    ) = Mono
        .using({
            Files.createDirectories(target.parent)
            AsynchronousFileChannel.open(target, StandardOpenOption.READ, StandardOpenOption.WRITE, StandardOpenOption.CREATE)
        }, {
            DataBufferUtils.write(data, it, offset).map { DataBufferUtils.release(it) }.then()
        }, {
            it.close()
        })
        .flatMap { if (target.checkSum() == hash) Mono.empty() else Mono.error { MaxioException("上传完之后 hash 值没 check 过") } }
        .subscribeOn(Schedulers.boundedElastic())
}
