package avalon.lingshin.maxio

import avalon.lingshin.maxio.config.MaxioException
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication class MaxIoApplication

fun main(args: Array<String>) {
    runApplication<MaxIoApplication>(*args)
}
