"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Subject } from "@/types/subject";
import { getLegalFormLabel } from '@/data/legal-forms';




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
export default function SubjectDetailsCard({ subject, setSubject }: { subject: Subject, setSubject: (subject: Subject) => void }) {

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


            </CardHeader>


            {/*persona fisica*/}

            {subject.type === "PHYSICAL" && (

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


                    <section className="space-y-2">
                        <h4 className="font-semibold">Dati anagrafici</h4>
                        <InfoRow label="Luogo di nascita" value={subject.birthPlace} />
                        <InfoRow label="Provincia" value={subject.birthProvince} />
                        <InfoRow
                            label="Data di nascita"
                            value={formatDate(subject.birthDate)}
                        />
                    </section>


                    <Separator />

                    {/* BANK */}
                    <section className="space-y-2">
                        <h4 className="font-semibold">Dati bancari</h4>
                        <InfoRow label="IBAN" value={subject.iban} />
                        <InfoRow label="SWIFT" value={subject.swift} />
                    </section>
                </CardContent>
            )}
            {/*persona giuridica*/}

            {subject.type === "LEGAL" && (
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
                        <h4 className="font-semibold">Sede legale</h4>
                        <InfoRow label="Via" value={subject.legalAddress} />
                        <InfoRow
                            label="Località"
                            value={[subject.legalCity, subject.legalProvince, subject.legalPostalCode, subject.legalCountry]
                                .filter(Boolean)
                                .join(" ")}
                        />
                        
                    </section>

                    <Separator />


                    <section className="space-y-2">
                        <h4 className="font-semibold">Dati societari</h4>
                        <InfoRow label="Partita IVA" value={subject.vatNumber} />
                        <InfoRow label="Codice fiscale" value={subject.legalTaxCode} />
                        <InfoRow label="Forma giuridica" value={getLegalFormLabel(subject.legalForm)} />
                        <InfoRow label="REA" value={subject.reaNumber} />
                        <InfoRow label="SDI" value={subject.sdiCode} />
                    </section>


                    <Separator />

                    <section className="space-y-2">
                        <h4 className="font-semibold">Responsabile legale</h4>
                        <InfoRow label="Nome" value={[subject.firstName, subject.lastName].filter(Boolean).join(" ")} />
                        <InfoRow label="Codice fiscale" value={subject.taxCode} />
                        <InfoRow label="Luogo di nascita" value={subject.birthPlace} />
                        <InfoRow label="Provincia" value={subject.birthProvince} />
                        <InfoRow
                            label="Data di nascita"
                            value={formatDate(subject.birthDate)}
                        />
                    </section>
                    <section className="space-y-2">
                        <h4 className="font-semibold">Residenza</h4>
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





                    {/* BANK */}
                    <section className="space-y-2">
                        <h4 className="font-semibold">Dati bancari</h4>
                        <InfoRow label="IBAN" value={subject.iban} />
                        <InfoRow label="SWIFT" value={subject.swift} />
                    </section>
                </CardContent>
            )}

        </Card>
    );
}
export type SubjectWithMeta = Subject & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
};  