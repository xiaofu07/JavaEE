package avalon.lingshin.maxio.security

import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import java.time.Instant
import java.util.*

data class Auth(
    val id: Long,
    val role: String,
) {
    val authorities: List<GrantedAuthority>?
        get() =
            when (role) {
                "user" -> listOf("user")
                "admin" -> listOf("admin", "user")
                else -> null
            }?.map { SimpleGrantedAuthority(it) }
}

class JwtService(
    secret: String = "sdfjlkasdfasdfhklweriosdfasdfll9",
) {
    private val key = Keys.hmacShaKeyFor(secret.toByteArray())

    fun generateToken(
        userId: Long,
        role: String,
        expiresInSeconds: Long = 3600,
    ): String {
        val now = Instant.now()
        return Jwts
            .builder()
            .subject(userId.toString()) // store user id in subject
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plusSeconds(expiresInSeconds)))
            .claim("role", role)
            .signWith(key)
            .compact()
    }

    fun parseToken(token: String): Auth? =
        try {
            Jwts
                .parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .payload
                .let {
                    Auth(it.subject.toLong(), it["role"].toString())
                }
        } catch (e: Exception) {
            null
        }
}
