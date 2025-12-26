package avalon.lingshin.maxio.config

import avalon.lingshin.maxio.model.ApiResponse
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.support.WebExchangeBindException
import reactor.core.publisher.Mono

open class MaxioException(
    message: String,
) : RuntimeException(message)

@ControllerAdvice
class ExceptionHandler {
    private fun <T : Exception> handle(
        exception: T,
        defaultMsg: String = "Error",
        getMessage: (T) -> String? = { it.message },
        httpStatus: HttpStatus = HttpStatus.BAD_REQUEST,
    ) = Mono.just(
        ResponseEntity(
            ApiResponse.fail<Any>(
                msg = getMessage(exception) ?: defaultMsg,
            ),
            httpStatus,
        ),
    )

    @ExceptionHandler(MaxioException::class)
    fun handleMaxio(exception: MaxioException) = handle(exception, defaultMsg = "Business Error")

    @ExceptionHandler(WebExchangeBindException::class)
    fun handleValidation(exception: WebExchangeBindException) =
        handle(
            exception,
            defaultMsg = "参数错误",
            getMessage = {
                it.bindingResult.fieldError?.defaultMessage
            },
        )

    @ExceptionHandler(Exception::class)
    fun handleGeneric(exception: Exception) = handle(exception, defaultMsg = "内部错误", httpStatus = HttpStatus.INTERNAL_SERVER_ERROR)
}
