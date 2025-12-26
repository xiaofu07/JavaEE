package avalon.lingshin.maxio.repository

import avalon.lingshin.maxio.entity.Bucket
import org.springframework.data.jpa.repository.JpaRepository
import java.util.Optional

interface BucketRepository : JpaRepository<Bucket, Long> {
    fun findAllByOwnerId(ownerId: Long): List<Bucket>

    fun findByNameAndOwnerId(
        name: String,
        ownerId: Long,
    ): Optional<Bucket>
}
