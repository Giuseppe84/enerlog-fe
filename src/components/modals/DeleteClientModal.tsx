import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Client } from './ClientFormModal';

interface DeleteClientModalProps {
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  clientToDelete: Client | null;
  handleDeleteCancel: () => void;
  handleDeleteConfirm: () => void;
}


export function DeleteClientModal({
  deleteDialogOpen,
  setDeleteDialogOpen,
  clientToDelete,
  handleDeleteCancel,
  handleDeleteConfirm,
}: DeleteClientModalProps) {

  const { t } = useTranslation();
  return (
    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('clients.deleteDialog.title')}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>{t('clients.deleteDialog.message', { firstName: clientToDelete?.firstName, lastName: clientToDelete?.lastName })}</p>
          <p className="text-sm text-muted-foreground mt-2">{t('clients.deleteDialog.undoWarning')}</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleDeleteCancel}>
            {t('common.cancel')}
          </Button>
          <Button variant="destructive" onClick={handleDeleteConfirm}>
            {t('common.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}