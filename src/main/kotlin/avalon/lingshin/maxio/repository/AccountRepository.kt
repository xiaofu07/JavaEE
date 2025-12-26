package avalon.lingshin.maxio.repository

import avalon.lingshin.maxio.entity.Account
import org.springframework.data.jpa.repository.JpaRepository

interface AccountRepository : JpaRepository<Account, Long> {
    fun findByUsername(username: String): Account?
}
