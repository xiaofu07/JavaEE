package avalon.lingshin.maxio.entity

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*

@Entity
@Table(name = "team")
class Team(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    @Column(nullable = false, unique = true, length = 100)
    val name: String,
    @ManyToOne
    @JoinColumn(name = "leader", nullable = false)
    val leader: User,
    @Column(columnDefinition = "text")
    val description: String? = null,
    @ManyToMany
    @JoinTable(
        name = "user_team",
        joinColumns = [JoinColumn(name = "team")],
        inverseJoinColumns = [JoinColumn(name = "users")],
    )
    @JsonIgnore
    val members: MutableSet<User>,
)
