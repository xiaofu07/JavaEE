package avalon.lingshin.maxio.entity

import jakarta.persistence.*
import org.hibernate.annotations.JdbcType
import org.hibernate.dialect.type.PostgreSQLEnumJdbcType

enum class Role { User, Admin, }

@Entity
@Table(name = "account")
class Account(
    @Id
    val username: String?,
    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "role")
    @JdbcType(PostgreSQLEnumJdbcType::class)
    val role: Role,
    @OneToOne
    @JoinColumn(name = "owner")
    val owner: User?,
    @Column(length = 256)
    val password: String?,
)
