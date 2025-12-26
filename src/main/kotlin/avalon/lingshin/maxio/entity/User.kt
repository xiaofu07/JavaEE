package avalon.lingshin.maxio.entity

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*

@Entity
@Table(name = "users")
class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    @Column(nullable = false, unique = true, length = 100)
    val name: String,
    @Column(unique = true, length = 150)
    val email: String?,
    @OneToMany(mappedBy = "leader")
    @JsonIgnore
    val teams: Set<Team>,
)
