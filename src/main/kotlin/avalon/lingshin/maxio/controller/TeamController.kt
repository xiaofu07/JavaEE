package avalon.lingshin.maxio.controller

import avalon.lingshin.maxio.entity.Team
import avalon.lingshin.maxio.service.TeamService
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

data class TeamDTO(
    var id: Long = 0,
    var name: String = "",
    var description: String? = null,
    var members: Array<Long>? = null,
) {
    constructor(team: Team) : this(
        id = team.id,
        name = team.name,
        description = team.description,
        members = team.members.map { it.id }.toTypedArray(),
    )
}

@RestController
@RequestMapping("/team")
class TeamController(
    private val teamService: TeamService,
) {
    @GetMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun all(
        @AuthenticationPrincipal uid: Long,
    ) = teamService.all(uid)

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    fun getById(
        @AuthenticationPrincipal uid: Long,
        @PathVariable id: Long,
    ) = teamService.getById(uid, id)

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun add(
        @AuthenticationPrincipal uid: Long,
        @RequestBody team: TeamDTO,
    ) = teamService.add(uid, team)

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    fun delete(
        @AuthenticationPrincipal uid: Long,
        @PathVariable id: Long,
    ) = teamService.delete(uid, id)

    @PatchMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    fun update(
        @AuthenticationPrincipal uid: Long,
        @PathVariable id: Long,
        @RequestBody data: TeamDTO,
    ) = teamService.update(uid, id, data)
}
