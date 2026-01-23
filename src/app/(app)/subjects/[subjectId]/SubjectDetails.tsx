"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SubjectModal } from "@/components/modals/SubjectFormModal";


// === TYPES ===
export type SubjectBase = {
    address?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    country?: string;
    email?: string;
    phone?: string;
    pecEmail?: string;
    birthDate?: Date;
    birthPlace?: string;
    birthProvince?: string;
    legalTaxCode?: string;
    legalAddress?: string;
    legalCity?: string;
    legalProvince?: string;
    legalPostalCode?: string;
    legalForm?: string;
    reaNumber?: string;
    sdiCode?: string;
    iban?: string;
    swift?: string;
};

export type PhysicalSubject = SubjectBase & {
    type: "PHYSICAL";
    firstName: string;
    lastName: string;
    taxCode: string;
};

export type LegalSubject = SubjectBase & {
    type: "LEGAL";
    companyName: string;
    vatNumber: string;
};

export type Subject = PhysicalSubject | LegalSubject;

function formatDate(date?: string | Date) {
    if (!date) return undefined;
    const d = typeof date === "string" ? new Date(date) : date;
    return isNaN(d.getTime()) ? undefined : d.toLocaleDateString("it-IT");
}


// === SMALL UI BLOCK ===
function InfoRow({ label, value }: { label: string; value?: string }) {
    if (!value) return null;
    return (
        <div className="grid grid-cols-3 gap-2 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="col-span-2 font-medium">{value}</span>
        </div>
    );
}

// === MAIN COMPONENT ===
export default function SubjectDetailsCard({ subject, setSubject }: { subject: Subject , setSubject: (subject: Subject) => void }) {

    const [isDeleting, setIsDeleting] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    console.log('Rendering SubjectDetailsCard with subject:', subject);
    const isPhysical = subject.type === "PHYSICAL";
    return (
        <Card className="rounded-2xl">
            <CardHeader className="space-y-1">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">
                        {isPhysical
                            ? `${subject.firstName} ${subject.lastName}`
                            : subject.companyName}
                    </CardTitle>
                    <Badge variant={isPhysical ? "default" : "secondary"}>
                        {subject.type}
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                    {isPhysical ? subject.taxCode : subject.vatNumber}
                </p>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="w-5 h-5" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() => setEditOpen(true)}
                            className="gap-2"
                        >
                            <Pencil className="w-4 h-4" />
                            Modifica
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={() => setIsDeleting(true)}
                            className="gap-2 text-red-600 focus:text-red-600"
                        >
                            <Trash2 className="w-4 h-4" />
                            Elimina
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* CONTACTS */}
                <section className="space-y-2">
                    <h4 className="font-semibold">Contatti</h4>
                    <InfoRow label="Email" value={subject.email} />
                    <InfoRow label="PEC" value={subject.pecEmail} />
                    <InfoRow label="Telefono" value={subject.phone} />
                </section>

                <Separator />

                {/* ADDRESS */}
                <section className="space-y-2">
                    <h4 className="font-semibold">Indirizzo</h4>
                    <InfoRow label="Via" value={subject.address} />
                    <InfoRow
                        label="Località"
                        value={[subject.city, subject.province, subject.postalCode]
                            .filter(Boolean)
                            .join(" ")}
                    />
                    <InfoRow label="Paese" value={subject.country} />
                </section>

                <Separator />

                {/* PERSONAL / LEGAL */}
                {isPhysical ? (
                    <section className="space-y-2">
                        <h4 className="font-semibold">Dati anagrafici</h4>
                        <InfoRow label="Luogo di nascita" value={subject.birthPlace} />
                        <InfoRow label="Provincia" value={subject.birthProvince} />
                        <InfoRow
                            label="Data di nascita"
                            value={formatDate(subject.birthDate)}
                        />
                    </section>
                ) : (
                    <section className="space-y-2">
                        <h4 className="font-semibold">Dati societari</h4>
                        <InfoRow label="Forma giuridica" value={subject.legalForm} />
                        <InfoRow label="REA" value={subject.reaNumber} />
                        <InfoRow label="SDI" value={subject.sdiCode} />
                    </section>
                )}

                <Separator />

                {/* BANK */}
                <section className="space-y-2">
                    <h4 className="font-semibold">Dati bancari</h4>
                    <InfoRow label="IBAN" value={subject.iban} />
                    <InfoRow label="SWIFT" value={subject.swift} />
                </section>
            </CardContent>
            <SubjectModal isOpen={editOpen} subject={subject} setIsOpen={setEditOpen} setSubject={setSubject} />
        </Card>
    );
}
export type SubjectWithMeta = Subject & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
};  