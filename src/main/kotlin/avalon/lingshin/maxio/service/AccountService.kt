package avalon.lingshin.maxio.service

import avalon.lingshin.maxio.config.MaxioException
import avalon.lingshin.maxio.entity.Account
import avalon.lingshin.maxio.entity.Role
import avalon.lingshin.maxio.entity.Team
import avalon.lingshin.maxio.entity.User
import avalon.lingshin.maxio.repository.AccountRepository
import avalon.lingshin.maxio.repository.UserRepository
import avalon.lingshin.maxio.security.JwtService
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.util.TreeSet

data class LoginDto(
    val username: String,
    val password: String,
)

data class RegisterDto(
    val username: String,
    val email: String,
    val password: String,
)

fun <T> T?.orThrow(e: Exception) = this ?: throw e

fun <T> T?.orThrow(msg: String) = this ?: throw Exception(msg)

@Service
class AccountService(
    private val accountRepository: AccountRepository,
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
) {
    fun login(account: LoginDto) =
        accountRepository
            .findByUsername(account.username)
            .orThrow(MaxioException("找不到这个用户"))
            .takeIf {
                passwordEncoder.matches(account.password, it.password)
            }.orThrow(MaxioException("密码不对啊"))
            .owner ?: throw MaxioException("没有用户")

    fun register(account: RegisterDto) =
        with(account) {
            accountRepository.save(
                Account(
                    username = username,
                    role = Role.User,
                    password = passwordEncoder.encode(password) ?: throw MaxioException("为什么加密返回空字符串"),
                    owner =
                        userRepository.save(
                            User(
                                name = username,
                                email = email,
                                teams = HashSet<Team>(),
                            ),
                        ),
                ),
            )
        }.owner ?: throw MaxioException("没有用户")
}
