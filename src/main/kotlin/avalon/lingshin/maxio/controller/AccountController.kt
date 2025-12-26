package avalon.lingshin.maxio.controller

import avalon.lingshin.maxio.entity.Account
import avalon.lingshin.maxio.security.JwtService
import avalon.lingshin.maxio.service.AccountService
import avalon.lingshin.maxio.service.LoginDto
import avalon.lingshin.maxio.service.RegisterDto
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseCookie
import org.springframework.http.server.reactive.ServerHttpResponse
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping
class AccountController(
    private val accountService: AccountService,
    private val jwtService: JwtService,
) {
    fun ServerHttpResponse.addCookie(value: String) {
        addCookie(
            ResponseCookie
                .from("token", value)
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/")
                .build(),
        )
    }

    @PostMapping("/login")
    @ResponseStatus(HttpStatus.OK)
    fun login(
        @RequestBody request: LoginDto,
        response: ServerHttpResponse,
    ) = accountService.login(request).also {
        response.addCookie(jwtService.generateToken(it.id, "user"))
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    fun register(
        @RequestBody request: RegisterDto,
        response: ServerHttpResponse,
    ) = accountService.register(request).also {
        response.addCookie(jwtService.generateToken(it.id, "user"))
    }
}
