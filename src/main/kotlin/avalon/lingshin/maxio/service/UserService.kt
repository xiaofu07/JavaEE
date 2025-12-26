package avalon.lingshin.maxio.service

import avalon.lingshin.maxio.entity.Account
import avalon.lingshin.maxio.entity.Bucket
import avalon.lingshin.maxio.repository.AccountRepository
import avalon.lingshin.maxio.repository.BucketRepository
import avalon.lingshin.maxio.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class UserService(
    private val accountRepository: AccountRepository,
    private val userRepository: UserRepository,
) {
    fun login(account: Account) {
    }
}
