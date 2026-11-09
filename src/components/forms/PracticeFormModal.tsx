import { Dialog, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CTPractice } from "@/types/practices"
import { CTPracticeSchema } from "@/validators/practiceSchema"
import { Calendar } from "lucide-react";
import { Calendar as DatePicker } from "@/components/ui/calendar"; // ShadCN Calendar
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { createOrUpdateCTPractice } from '@/api/practices'
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SubjectStep } from './practiceTabs/SubjectStep'
import { SetStateAction, useEffect, useState } from "react";

export type CTPracticeFormValues = z.infer<typeof CTPracticeSchema>;

interface Props {
  isOpen: boolean;
  setIsOpen: () => void;
  initialValues?: Partial<CTPracticeFormValues>;
  setPractice: (values: CTPracticeFormValues) => void;
}
const CT_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Bozza',
  READY_TO_SUBMIT: 'Pronta per l’invio',
  SUBMITTED: 'Inviata',
  UNDER_REVIEW: 'In revisione',
  APPROVED: 'Approvata',
  REJECTED: 'Respinta',
  PAID: 'Pagata',
}

export function CTPracticeDialog({ isOpen, setIsOpen, initialValues, setPractice }: Props) {
  const EMPTY_PRACTICE_FORM: CTPracticeFormValues = {
    name: '',
    description: '',
    status: 'DRAFT',
    practiceCode: '',
    interventionTypeId: '',
    serviceId: '',
    mandateForCollection: false,
    CTstatus: 'DRAFT',
    iban: undefined,
    amount: undefined,
    incentiveAmount: undefined,

    ...initialValues, // sovrascrive solo campi validi
  };

    const [selectedClient, setSelectedClient] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<{
    id: string;
    name: string;
  } | null>(null);
  type FormValues = z.infer<typeof CTPracticeSchema>;
  const form = useForm({
    resolver: zodResolver(CTPracticeSchema),
    defaultValues: EMPTY_PRACTICE_FORM,
  });
  const handleSuccess = (message: string) => {
    toast.success("Soggetto salvato con successo", {
      description: message,
    });
    setIsOpen(false);
  };

  const handleError = (message?: string) => {

    toast.error("Problemi di salvataggio", {
      description: message,
    });
  };
  const onSubmit: SubmitHandler<CTPracticeFormValues> = async (values) => {

    console.log(values)
    try {



      const response = await createOrUpdateCTPractice(values as CTPractice);
      console.log("API response:", response);
      setPractice(response.practice);
      handleSuccess(response.message);


    } catch (error) {
      console.error("Error saving subject:", error);
      handleError();

    }

  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogTitle>Pratica Conto Termico</DialogTitle>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Tabs defaultValue="subjects" className="mt-8">
            <TabsList>
              <TabsTrigger value="subjects">Cliente / Soggetto / Immobile</TabsTrigger>
              <TabsTrigger value="general">Dati pratica</TabsTrigger>
              <TabsTrigger value="ct">Conto Termico</TabsTrigger>
            </TabsList>

            <TabsContent value="subjects" className="space-y-4 mt-6">
              <SubjectStep form={form} setSelectedClient={setSelectedClient} setSelectedSubject={setSelectedSubject} />



            </TabsContent>



         <TabsContent value="general" className="space-y-4 mt-6">

            <div className="space-y-4  mt-10">
              <h3 className="font-semibold">Dati anagrafici</h3>

              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div>
                    <Label>Nome</Label>
                    <Input {...field} value={field.value ?? ''} className={fieldState.error ? 'border-destructive' : ''} />
                    {fieldState.error && (
                      <p className="text-sm text-destructive">{fieldState.error.message}</p>
                    )}
                  </div>
                )}
              />
              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div>
                    <Label>Descrizione</Label>
                    <Input {...field} value={field.value ?? ''} className={fieldState.error ? 'border-destructive' : ''} />
                    {fieldState.error && (
                      <p className="text-sm text-destructive">{fieldState.error.message}</p>
                    )}
                  </div>
                )}
              />

              <Controller
                name="status"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div>
                    <Label>Status</Label>

                    <Select
                      value={field.value ?? ''}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        className={fieldState.error ? 'border-destructive' : ''}
                      >
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="PLANNED">Planned</SelectItem>
                        <SelectItem value="IN_PROGRESS">In progress</SelectItem>
                        <SelectItem value="SUSPENDED">Suspended</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>

                    {fieldState.error && (
                      <p className="text-sm text-destructive">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <Controller
                name="type"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div>
                    <Label>Tipo</Label>
                    <Input {...field} value={field.value ?? ''} className={fieldState.error ? 'border-destructive' : ''} />
                    {fieldState.error && (
                      <p className="text-sm text-destructive">{fieldState.error.message}</p>
                    )}
                  </div>
                )}
              />
              <Controller
                name="amount"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div>
                    <Label>Importo</Label>
                    <Input
                      {...field}
                      type="number"
                      value={field.value ?? ''}
                      className={fieldState.error ? 'border-destructive' : ''}
                    />
                    {fieldState.error && (
                      <p className="text-sm text-destructive">{fieldState.error.message}</p>
                    )}
                  </div>
                )}
              />

              <Controller name="startDate" control={form.control} render={({ field, fieldState }) => (
                <div>
                  <Label>Data inizio</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={`w-full ${fieldState.error ? "border-destructive" : ""}`}>
                        {field.value ? format(new Date(field.value), "yyyy-MM-dd") : "Seleziona data"}
                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <DatePicker
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date ? date.toISOString() : "")}
                      />
                    </PopoverContent>
                  </Popover>
                  {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                </div>
              )} />
              <Controller name="endDate" control={form.control} render={({ field, fieldState }) => (
                <div>
                  <Label>Data fine</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={`w-full ${fieldState.error ? "border-destructive" : ""}`}>
                        {field.value ? format(new Date(field.value), "yyyy-MM-dd") : "Seleziona data"}
                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <DatePicker
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date ? date.toISOString() : "")}
                      />
                    </PopoverContent>
                  </Popover>
                  {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                </div>
              )} />
              <Controller
                name="serviceId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div>
                    <Label>Servizio</Label>
                    <Input {...field} value={field.value ?? ''} className={fieldState.error ? 'border-destructive' : ''} />
                    {fieldState.error && (
                      <p className="text-sm text-destructive">{fieldState.error.message}</p>
                    )}
                  </div>
                )}
              />
              <Controller
                name="practiceCode"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div>
                    <Label>Codice pratica</Label>
                    <Input {...field} value={field.value ?? ''} className={fieldState.error ? 'border-destructive' : ''} />
                    {fieldState.error && (
                      <p className="text-sm text-destructive">{fieldState.error.message}</p>
                    )}
                  </div>
                )}
              />

              <Controller
                name="incentiveAmount"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div>
                    <Label>Ammontare incentivo</Label>
                    <Input
                      {...field}
                      type="number"
                      value={field.value ?? ''}
                      className={fieldState.error ? 'border-destructive' : ''}
                    />
                    {fieldState.error && (
                      <p className="text-sm text-destructive">{fieldState.error.message}</p>
                    )}
                  </div>
                )}
              />

              <Controller
                name="CTstatus"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="col-span-2">
                    <Label>Stato</Label>

                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={fieldState.error ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Seleziona stato" />
                      </SelectTrigger>

                      <SelectContent>
                        {Object.entries(CT_STATUS_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {fieldState.error && (
                      <p className="text-sm text-destructive">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <Controller
                name="iban"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div>
                    <Label>IBAN</Label>
                    <Input {...field} value={field.value ?? ''} className={fieldState.error ? 'border-destructive' : ''} />
                    {fieldState.error && (
                      <p className="text-sm text-destructive">{fieldState.error.message}</p>
                    )}
                  </div>
                )}
              />



              <Controller
                name="status"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="col-span-2">
                    <Label>Stato</Label>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={fieldState.error ? 'border-destructive' : ''}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['DRAFT', 'READY_TO_SUBMIT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PAID'].map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.error && (
                      <p className="text-sm text-destructive">{fieldState.error.message}</p>
                    )}
                  </div>
                )}
              />

              <Controller
                name="mandateForCollection"
                control={form.control}
                render={({ field }) => (
                  <div className="col-span-2 flex items-center gap-2">
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    <Label>Mandato incasso</Label>
                  </div>
                )}
              />

              <Controller
                name="mandatarySubjectId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div>
                    <Label>Soggetto mandatario</Label>
                    <Input {...field} value={field.value ?? ''} className={fieldState.error ? 'border-destructive' : ''} />
                    {fieldState.error && (
                      <p className="text-sm text-destructive">{fieldState.error.message}</p>
                    )}
                  </div>
                )}
              />

              <Controller
                name="CTstatus"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="col-span-2">
                    <Label>Stato domanda Conto Termico</Label>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={fieldState.error ? 'border-destructive' : ''}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['DRAFT', 'READY_TO_SUBMIT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PAID'].map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.error && (
                      <p className="text-sm text-destructive">{fieldState.error.message}</p>
                    )}
                  </div>
                )}
              />

              <Controller name="submittedAt" control={form.control} render={({ field, fieldState }) => (
                <div>
                  <Label>Data invio</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={`w-full ${fieldState.error ? "border-destructive" : ""}`}>
                        {field.value ? format(new Date(field.value), "yyyy-MM-dd") : "Seleziona data"}
                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <DatePicker
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date ? date.toISOString() : "")}
                      />
                    </PopoverContent>
                  </Popover>
                  {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                </div>
              )} />
              <Controller name="approvedAt" control={form.control} render={({ field, fieldState }) => (
                <div>
                  <Label>Data approvazione</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={`w-full ${fieldState.error ? "border-destructive" : ""}`}>
                        {field.value ? format(new Date(field.value), "yyyy-MM-dd") : "Seleziona data"}
                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <DatePicker
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date ? date.toISOString() : "")}
                      />
                    </PopoverContent>
                  </Popover>
                  {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                </div>
              )} />
              <Controller name="valueDate" control={form.control} render={({ field, fieldState }) => (
                <div>
                  <Label>Data valuta</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={`w-full ${fieldState.error ? "border-destructive" : ""}`}>
                        {field.value ? format(new Date(field.value), "yyyy-MM-dd") : "Seleziona data"}
                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <DatePicker
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date ? date.toISOString() : "")}
                      />
                    </PopoverContent>
                  </Popover>
                  {fieldState.error && <p className="text-sm text-destructive">{fieldState.error.message}</p>}
                </div>
              )} />
            </div>
            </TabsContent>
          </Tabs>
          <DialogFooter className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Annulla
            </Button>
            <Button type="submit">Salva</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
