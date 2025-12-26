package avalon.lingshin.maxio.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "backup")
class Backup(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    @Column(length = 100)
    val name: String?,
    @ManyToOne
    @JoinColumn(name = "bucket", nullable = false)
    val bucket: Bucket,
    @Column(name = "backup_time", nullable = false, columnDefinition = "timestamp without time zone default current_timestamp")
    val backupTime: LocalDateTime = LocalDateTime.now(),
    @Column(columnDefinition = "text")
    val comment: String?,
)
