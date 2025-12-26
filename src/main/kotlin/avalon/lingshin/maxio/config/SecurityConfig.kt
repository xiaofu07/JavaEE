package avalon.lingshin.maxio.config

import avalon.lingshin.maxio.model.ApiResponse
import avalon.lingshin.maxio.security.JwtService
import avalon.lingshin.maxio.security.jwtAuthenticationWebFilter
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpStatus.FORBIDDEN
import org.springframework.http.HttpStatus.UNAUTHORIZED
import org.springframework.http.MediaType
import org.springframework.http.server.reactive.ServerHttpResponse
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity
import org.springframework.security.config.web.server.SecurityWebFiltersOrder
import org.springframework.security.config.web.server.ServerHttpSecurity
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import reactor.core.publisher.Mono

fun ServerHttpResponse.writeObject(value: Any) =
    writeWith(
        Mono.just(
            bufferFactory()
                .wrap(
                    ObjectMapper().writeValueAsBytes(
                        value,
                    ),
                ),
        ),
    )

@Configuration
@EnableWebFluxSecurity
class SecurityConfig {
    @Bean
    fun jwtService() = JwtService()

    @Bean
    fun passwordEncoder() = BCryptPasswordEncoder(12)

    @Bean
    fun springSecurityFilterChain(
        http: ServerHttpSecurity,
        jwtService: JwtService,
    ) = http
        .authorizeExchange {
            it.pathMatchers("/login", "/register", "/test").permitAll()
            it.pathMatchers("/admin/**").hasAnyAuthority("admin")
            it.anyExchange().authenticated()
        }.addFilterAt(
            jwtAuthenticationWebFilter(jwtService),
            SecurityWebFiltersOrder.AUTHENTICATION,
        ).exceptionHandling {
            it.authenticationEntryPoint { exchange, _ ->
                exchange.response
                    .apply {
                        statusCode = UNAUTHORIZED
                        headers.contentType = MediaType.APPLICATION_JSON
                    }.writeObject(ApiResponse.unauthorized<Any>())
            }

            it.accessDeniedHandler { exchange, _ ->
                exchange.response
                    .apply {
                        statusCode = FORBIDDEN
                        headers.contentType = MediaType.APPLICATION_JSON
                    }.writeObject(ApiResponse.forbidden<Any>())
            }
        }.csrf { it.disable() }
        .build()
}
