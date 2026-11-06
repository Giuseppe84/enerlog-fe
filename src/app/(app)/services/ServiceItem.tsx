import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    TableCell,
    TableRow,
} from "@/components/ui/table"
import { useRouter } from "next/navigation";
import dayjs from "dayjs"
import {Service} from "@/types/service"



export function ServiceItem({ service }: Service) {
    const router = useRouter();
    const isRecent = dayjs().diff(dayjs(service.createdAt), "day") <= 7
    return (
        <TableRow
            onClick={() => router.push("/services/" + service.id)}
            className={`cursor-pointer transition border hover:shadow-lg hover:border-primary/40 ${isRecent ? "border-primary/50 bg-primary/5" : ""}`}
        >


            <TableCell>
                <div className="font-semibold truncate">
                    {service.name || service.code}
                </div>
            </TableCell>
            <TableCell>
                <div className="truncate">
                    {service.code}
                </div>
            </TableCell>

            <TableCell className="text-sm text-muted-foreground">

                <div className="text-xs font-extralight truncate">
                    {service.category}
                </div>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
                <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                    {service.isActive ? "Attivo" : "Non attivo"}
                </Badge>


            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
                <div className="text-xs text-muted-foreground">
                    {dayjs(service.createdAt).format("DD/MM/YYYY")}
                </div>


            </TableCell>
            <TableCell className="text-right" >
                {service.price} €
            </TableCell>
        </TableRow>
    );
}





