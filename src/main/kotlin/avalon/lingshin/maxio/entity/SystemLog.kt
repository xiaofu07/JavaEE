package avalon.lingshin.maxio.entity

import avalon.lingshin.maxio.model.LogLevel
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "system_log")
class SystemLog(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    @Column(columnDefinition = "timestamp without time zone default current_timestamp")
    val time: LocalDateTime = LocalDateTime.now(),
    @Enumerated(EnumType.STRING)
    val level: LogLevel?,
    @Column(columnDefinition = "text")
    val message: String?,
)
