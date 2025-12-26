package avalon.lingshin.maxio.repository

import avalon.lingshin.maxio.entity.Obj
import org.springframework.data.jpa.repository.JpaRepository

interface ObjRepository : JpaRepository<Obj, Long>
