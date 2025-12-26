package avalon.lingshin.maxio.entity

import jakarta.persistence.*

@Entity
@Table(name = "bucket")
class Bucket(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    @Column(nullable = false, unique = true, length = 100)
    val name: String,
    @ManyToOne
    @JoinColumn(name = "owner", nullable = false)
    val owner: User,
    @Column(columnDefinition = "text")
    val description: String? = null,
)
