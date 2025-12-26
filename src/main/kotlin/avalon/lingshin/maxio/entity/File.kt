package avalon.lingshin.maxio.entity

import com.fasterxml.jackson.annotation.JsonManagedReference
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToOne
import jakarta.persistence.Table

@Entity
@Table(name = "file")
class File(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    @Column(length = 100)
    val name: String?,
    @ManyToOne
    @JoinColumn(name = "bucket", nullable = false)
    val bucket: Bucket,
    @Column(length = 100)
    val mimeType: String?,
    @OneToOne
    @JsonManagedReference
    @JoinColumn(name = "current")
    var current: Obj?,
    @Column(columnDefinition = "text")
    val description: String? = null,
)
