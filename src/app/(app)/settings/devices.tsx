'use client'

import { useEffect, useState } from "react";
import { fetchDevices } from "@/api/devices";
import axios from "axios";
import { FaChrome, FaFirefox, FaSafari, FaWindows, FaLinux } from "react-icons/fa";
import { SiApple, SiAndroid } from "react-icons/si";
import { FiSmartphone } from "react-icons/fi";
interface Device {
    id: string;
    browser: string;
    os: string;
    ip: string;
    geoZone: string | null;
    expiresAt: string;
    updatedAt: string;
    isCurrent: boolean;
    blocked: boolean;
}

// helper per scegliere icona del browser
const getBrowserIcon = (browser: string) => {
    const b = browser.toLowerCase();
    if (b.includes("chrome")) return <FaChrome className="inline mr-1" />;
    if (b.includes("firefox")) return <FaFirefox className="inline mr-1" />;
    if (b.includes("safari")) return <FaSafari className="inline mr-1" />;
    return <FaChrome className="inline mr-1" />;
};

// helper per scegliere icona OS
const getOSIcon = (os: string) => {
    const o = os.toLowerCase();
    if (o.includes("windows")) return <FaWindows className="inline mr-1" />;
    if (o.includes("linux")) return <FaLinux className="inline mr-1" />;
    if (o.includes("mac")) return <SiApple className="inline mr-1" />;
    if (o.includes("android")) return <SiAndroid className="inline mr-1" />;
    if (o.includes("ios") || o.includes("iphone")) return <FiSmartphone className="inline mr-1" />;
    return <FiSmartphone className="inline mr-1" />;
};

export const DevicesPanel = () => {
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);
    const [blockingId, setBlockingId] = useState<string | null>(null);

    useEffect(() => {

        try {
            fetchDevices().then(({result})=>{
                console.log(result)
               setDevices(result); 
            }
                );
        } catch (err) {
            console.error("Error fetching devices:", err);
        } finally {
            setLoading(false);
        }



    }, []);

    const blockDevice = async (id: string) => {
        setBlockingId(id);
        try {
            await axios.post(`/api/devices/${id}/block`);
            setDevices((prev) =>
                prev.map((d) => (d.id === id ? { ...d, blocked: true } : d))
            );
        } catch (err) {
            console.error("Error blocking device:", err);
        } finally {
            setBlockingId(null);
        }
    };

    if (loading) return <p>Loading devices...</p>;

    return (
        <div className="p-4 space-y-4">
          
            {devices.map((device) => (
                <div
                    key={device.id}
                    className={`p-4 border rounded-md flex justify-between items-center ${device.isCurrent ? "bg-blue-50 border-blue-300" : "bg-white"
                        } ${device.blocked ? "opacity-50" : ""}`}
                >
                    <div>
                        <p className="flex items-center gap-2">
                            {getBrowserIcon(device.browser)}
                            <strong>{device.browser}</strong>
                        </p>
                        <p className="flex items-center gap-2">
                            {getOSIcon(device.os)}
                            {device.os}
                        </p>
                        <p>IP: {device.ip}</p>
                        <p>Geo: {device.geoZone || "Unknown"}</p>
                        <p>Expires: {new Date(device.expiresAt).toLocaleDateString()}</p>
                        <p>Last updated: {new Date(device.updatedAt).toLocaleString()}</p>
                        {device.isCurrent && <p className="text-sm text-blue-600">Current device</p>}
                        {device.blocked && <p className="text-sm text-red-600">Blocked</p>}
                    </div>

                  
                </div>
            ))}

            {devices.length === 0 && <p>No devices found.</p>}
        </div>
    );
};
