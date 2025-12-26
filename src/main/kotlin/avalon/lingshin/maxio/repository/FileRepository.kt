package avalon.lingshin.maxio.repository

import avalon.lingshin.maxio.entity.File
import avalon.lingshin.maxio.entity.Obj
import org.springframework.data.jpa.repository.JpaRepository
import java.util.Optional

interface FileRepository : JpaRepository<File, Long> {
    fun findByNameAndBucketId(
        name: String,
        bucketId: Long,
    ): Optional<File>
}
