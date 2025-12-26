package avalon.lingshin.maxio.controller

import avalon.lingshin.maxio.service.BucketService
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import java.util.Base64

data class BucketDto(
    val name: String,
    val description: String?,
)

@RestController
@RequestMapping("/buckets")
class BucketController(
    private val bucketService: BucketService,
) {
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createBucket(
        @RequestBody request: BucketDto,
        @AuthenticationPrincipal uid: Long,
    ) = bucketService.createBucket(uid, request)

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    fun getAllBucket(
        @AuthenticationPrincipal uid: Long,
    ) = bucketService.getAllBucketOf(uid)

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    fun getBucket(
        @AuthenticationPrincipal uid: Long,
        @PathVariable id: Long,
    ) = bucketService.getBucketOf(uid, id)

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    fun deleteBucket(
        @AuthenticationPrincipal uid: Long,
        @PathVariable id: Long,
    ) = bucketService.deleteBucketOf(uid, id)
}
