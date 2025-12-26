package avalon.lingshin.maxio.security

import org.springframework.http.HttpHeaders
import org.springframework.security.authentication.AbstractAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.web.server.authentication.AuthenticationWebFilter
import org.springframework.security.web.server.authentication.ServerAuthenticationConverter
import org.springframework.web.server.ServerWebExchange
import reactor.core.publisher.Mono

class JwtAuthenticationToken(
    val userId: Long,
    authorities: Collection<GrantedAuthority>,
) : AbstractAuthenticationToken(authorities) {
    init {
        super.setAuthenticated(true)
    }

    override fun getCredentials() = ""

    override fun getPrincipal() = userId
}

class JwtServerAuthenticationConverter(
    private val jwtService: JwtService,
) : ServerAuthenticationConverter {
    override fun convert(exchange: ServerWebExchange): Mono<Authentication> {
        val bearer =
            exchange.request.headers
                .getFirst(HttpHeaders.AUTHORIZATION)
                ?.takeIf { it.startsWith("Bearer ") }
                ?.removePrefix("Bearer ")
        val cookieToken =
            exchange.request.cookies
                .getFirst("token")
                ?.value
        val token = bearer ?: cookieToken ?: return Mono.empty()
        val auth = jwtService.parseToken(token) ?: return Mono.empty()
        return Mono.just(JwtAuthenticationToken(auth.id, auth.authorities ?: return Mono.empty()))
    }
}

fun jwtAuthenticationWebFilter(jwtService: JwtService) =
    AuthenticationWebFilter { auth: Authentication -> Mono.just(auth) }.apply {
        setServerAuthenticationConverter(JwtServerAuthenticationConverter(jwtService))
    }
