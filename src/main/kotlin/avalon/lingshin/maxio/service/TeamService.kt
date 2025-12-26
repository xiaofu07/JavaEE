package avalon.lingshin.maxio.service

import avalon.lingshin.maxio.config.MaxioException
import avalon.lingshin.maxio.controller.TeamDTO
import avalon.lingshin.maxio.entity.Team
import avalon.lingshin.maxio.entity.User
import avalon.lingshin.maxio.repository.TeamRepository
import avalon.lingshin.maxio.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class TeamService(
    private val teamRepository: TeamRepository,
    private val userRepository: UserRepository,
) {
    @Transactional
    fun all(uid: Long) = teamRepository.findAllByLeaderId(uid).map { TeamDTO(it) }

    @Transactional(readOnly = false)
    fun add(
        uid: Long,
        team: TeamDTO,
    ) = teamRepository
        .save(
            Team(
                name = team.name,
                leader = userRepository.findById(uid).orElseThrow { NoSuchElementException("User with id $uid not found") },
                description = team.description,
                members =
                    team.members
                        ?.map {
                            userRepository
                                .findById(
                                    it,
                                ).orElseThrow { NoSuchElementException("User with id $it not found") }
                        }?.toMutableSet()
                        ?: mutableSetOf(),
            ),
        ).let { TeamDTO(it) }

    private fun <T> checkLeader(
        uid: Long,
        id: Long,
        callback: (Team) -> T,
    ) = teamRepository
        .findById(id)
        .orElseThrow { NoSuchElementException("Team $id not found") }
        .let {
            require(it.leader.id == uid) { "Team ${it.leader.id} not owned by User $uid" }
            callback(it)
        }

    fun delete(
        uid: Long,
        id: Long,
    ) = checkLeader(uid, id) {
        teamRepository.deleteById(id)
    }

    @Transactional
    fun getById(
        uid: Long,
        id: Long,
    ) = checkLeader(uid, id) {
        TeamDTO(it)
    }

    @Transactional
    fun update(
        uid: Long,
        id: Long,
        data: TeamDTO,
    ) = checkLeader(uid, id) {
        TeamDTO(
            teamRepository
                .save(
                    Team(
                        id = it.id,
                        name = data.name.takeIf(String::isNotBlank) ?: it.name,
                        leader = it.leader,
                        description = data.description?.takeIf(String::isNotBlank) ?: it.description,
                        members = data.members?.map { userRepository.getReferenceById(id) }?.toMutableSet() ?: it.members,
                    ),
                ),
        )
    }
}
