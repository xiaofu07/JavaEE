package avalon.lingshin.maxio.controller

import avalon.lingshin.maxio.service.FileService
import org.springframework.core.io.buffer.DataBuffer
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import reactor.core.publisher.Flux

data class FileDTO(
    val name: String,
    val type: String,
    val data: Flux<DataBuffer>,
    val hash: String,
)

@RestController
@RequestMapping("/blob")
class FileController(
    private val fileService: FileService,
) {
    @PostMapping("/{user}/{bucket}/{file}")
    fun upload(
        @AuthenticationPrincipal uid: Long,
        @PathVariable("user") user: String,
        @PathVariable("bucket") bucket: String,
        @PathVariable("file") filename: String,
        @RequestHeader("Content-Type") contentType: String,
        @RequestHeader("Upload-Offset", defaultValue = "0") offset: Long,
        @RequestHeader("Upload-Hash") hash: String,
        @RequestBody file: Flux<DataBuffer>,
    ) = fileService.upload(uid, user, bucket, FileDTO(filename, contentType, file, hash), offset = offset)
}
