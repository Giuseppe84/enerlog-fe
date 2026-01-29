import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useRouter } from "next/navigation";
import dayjs from "dayjs"


interface ServiceCardProps {
    service: {
        id: string,
        code: string,
        color: string,
        image: string,
        description: string,
        name: string,
        price: number,
        url?: string | null;
        category: String,
        tags?: {
            name?: string;
            color?: string;
        };
        createdAt?: string;
    };
}

export function ServiceCard({ service }: ServiceCardProps) {
    const router = useRouter();
 const isRecent = dayjs().diff(dayjs(service.createdAt), "day") <= 7
    return (
        <Card key={service.id} className="relative mx-auto w-2xl max-w-sm pt-0 hover:shadow-lg hover:border-primary/40  ">
             
            <div className="relative">
       
            

                 <div className="absolute inset-0 flex flex-col justify-between p-4">
            
                    <img
                        src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNzYiIGhlaWdodD0iMTc2IiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Y1ZWMwMCIgc3Ryb2tlLXdpZHRoPSIxLjc1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXNoaWVsZC1jaGVjay1pY29uIGx1Y2lkZS1zaGllbGQtY2hlY2siPjxwYXRoIGQ9Ik0yMCAxM2MwIDUtMy41IDcuNS03LjY2IDguOTVhMSAxIDAgMCAxLS42Ny0uMDFDNy41IDIwLjUgNCAxOCA0IDEzVjZhMSAxIDAgMCAxIDEtMWMyIDAgNC41LTEuMiA2LjI0LTIuNzJhMS4xNyAxLjE3IDAgMCAxIDEuNTIgMEMxNC41MSAzLjgxIDE3IDUgMTkgNWExIDEgMCAwIDEgMSAxeiIvPjxwYXRoIGQ9Im05IDEyIDIgMiA0LTQiLz48L3N2Zz4="
                        alt="Icon"
                        className="w-12 h-12 rounded-full border-2 border-amber-300"
                    />

                    <div className="text-white">
                        <h1 className="text-2xl font-bold">{service.name}</h1>
                        {service.description && <p className="text-sm opacity-80">{service.description}</p>}
                    </div>
                </div>
                    <div className="border-b-8 border-b-amber-300 absolute inset-0 z-30 aspect-video bg-amber-400/15" />
                <img
                    src={service.image}
                    alt="Event cover"
                    className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-20"
                />
            </div>
           
            <CardHeader >
                <CardAction>
                    <Badge variant="secondary">{service.category}</Badge>
                </CardAction>
                <CardTitle >{service.name}</CardTitle>
                <CardDescription>
                    {service.description}
                </CardDescription>
            </CardHeader>
            <CardFooter>
                <Button
                    onClick={() => router.push("/services/" + service.id)}
                    className="w-full">Apri</Button>
            </CardFooter>
        </Card>
    );
}