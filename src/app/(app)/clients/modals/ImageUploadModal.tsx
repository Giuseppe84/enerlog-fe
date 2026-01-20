"use client";
import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cropImage } from "@/utils/cropImage";
import { Vibrant } from "node-vibrant/browser";
import { uploadClientAvatarAndColors } from '@/api/clients';
import { ImageDropzone } from "@/components/fields/image-drop-zone";


export default function ImageUploadModal({ open, onClose, onComplete, clientId }: {
    open: boolean;
    onClose: () => void;
    onComplete: (data: { image: string | Blob; colors: string[] }) => void;
    clientId: string;
}) {
   const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [colors, setColors] = useState([]);

    const onCropComplete = useCallback((_, croppedPixels: any) => {
        setCroppedAreaPixels(croppedPixels);

    }, []);

    const onFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => setImageSrc(reader.result);
        reader.readAsDataURL(file);
    };

    const handleConfirm = async () => {
        try {
            if (!croppedAreaPixels || !imageSrc) return;
            const croppedImage = await cropImage(imageSrc, croppedAreaPixels, 512, 512);
            const palette = await Vibrant.from(imageSrc).getPalette();

            const vibrantColors = [palette.Vibrant?.hex, palette.Muted?.hex].filter(Boolean);
            setColors(vibrantColors);


            await uploadClientAvatarAndColors(clientId, croppedImage instanceof Blob ? croppedImage : await (async () => {
                const res = await fetch(croppedImage);
                return await res.blob();
            })(), vibrantColors);
            onComplete({ image: croppedImage, colors: vibrantColors });
            onClose();
        } catch (error) {
            console.error("Errore durante l'upload dell'immagine:", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Upload immagine</DialogTitle>
                </DialogHeader>

                {!imageSrc && (
                    <ImageDropzone
                        onFileSelected={(file) => {
                            const reader = new FileReader();
                            reader.onload = () => setImageSrc(reader.result as string);
                            reader.readAsDataURL(file);
                        }}
                    />
                )}

                {imageSrc && (
                    <div className="relative w-full h-64 bg-black">
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                        />
                    </div>
                )}

                {imageSrc && (
                    <div className="mt-4">
                        <Slider min={1} max={3} step={0.1} value={[zoom]} onValueChange={([z]) => setZoom(z)} />
                    </div>
                )}

                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="secondary" onClick={onClose}>Annulla</Button>
                    <Button onClick={handleConfirm}>Conferma</Button>
                </div>

                {colors.length > 0 && (
                    <div className="flex gap-2 mt-4">
                        {colors.map((c) => (
                            <div key={c} className="w-10 h-10 rounded" style={{ backgroundColor: c }} />
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
