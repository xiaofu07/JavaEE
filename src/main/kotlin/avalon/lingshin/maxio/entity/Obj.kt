package avalon.lingshin.maxio.entity

import com.fasterxml.jackson.annotation.JsonBackReference
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "object")
class Obj(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    @Column(nullable = false, length = 256)
    val hash: String,
    @ManyToOne
    @JoinColumn(name = "parent")
    val parent: Obj?,
    @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "file", nullable = false)
    val file: File,
    @ManyToOne
    @JoinColumn(name = "who", nullable = false)
    val who: User,
    @Column(columnDefinition = "timestamp without time zone default current_timestamp")
    val time: LocalDateTime = LocalDateTime.now(),
    @Column(columnDefinition = "text")
    val description: String? = null,
)
