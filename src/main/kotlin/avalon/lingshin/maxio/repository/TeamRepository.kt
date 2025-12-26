package avalon.lingshin.maxio.repository

import avalon.lingshin.maxio.entity.Team
import org.springframework.data.jpa.repository.JpaRepository

interface TeamRepository : JpaRepository<Team, Long> {
    fun findAllByLeaderId(uid: Long): Set<Team>
}
