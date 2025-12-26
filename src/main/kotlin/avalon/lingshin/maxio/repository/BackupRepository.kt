package avalon.lingshin.maxio.repository

import avalon.lingshin.maxio.entity.Bucket
import org.springframework.data.jpa.repository.JpaRepository

interface BackupRepository : JpaRepository<Bucket, Long>
