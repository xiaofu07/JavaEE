package avalon.lingshin.maxio.model

import org.springframework.http.HttpStatus

data class ApiResponse<T>(
    val code: Int,
    val msg: String,
    val data: T? = null,
) {
    companion object {
        fun <T> success(
            data: T? = null,
            msg: String = "",
        ) = ApiResponse(code = HttpStatus.OK.value(), msg = msg, data = data)

        fun <T> fail(
            code: Int = HttpStatus.EXPECTATION_FAILED.value(),
            msg: String = "操作失败，请检查参数",
        ) = ApiResponse(code = code, msg = msg, data = null)

        fun <T> unauthorized(msg: String = "未认证或Token无效") = ApiResponse(code = HttpStatus.UNAUTHORIZED.value(), msg = msg, data = null)

        fun <T> forbidden(msg: String = "权限不足") = ApiResponse(code = HttpStatus.FORBIDDEN.value(), msg = msg, data = null)
    }
}
