// src/api/subjects.ts
import { sub } from 'date-fns';
import api from './axiosInstance';
import type { Subject, SubjectsResponse } from '@/types/subject';
import { normalizeEmptyToNull } from '@/utils/normalize';

export const fetchSubjects = async (
  page = 1,
  limit = 10,
  search?: string
): Promise<SubjectsResponse> => {
  const res = await api.get('/subjects', {
    params: { page, limit, search },
  });

  return res.data;
};
export const createOrUpdateSubject = async (subject: Subject) => {

  const data = normalizeEmptyToNull(subject);
  // Gestione userSubjects solo per nuovo inserimento
  if (!data.id) {
    data.userSubjects = data.userSubjects?.map(us => ({
      ...us,
      isSamePerson: us.isSamePerson ?? false
    })) ?? [];
  }

  const response = data.id
    ? await api.put(`/subjects/${data.id}`, data)
    : await api.post('/subjects', data);
  return response.data;
};



export const fetchSubjectById = async (id: string) => {
  const response = await api.get(`/subjects/${id}`);
  return response.data;
};
export const assignSubjectToClient = async (clientId: string, subjectId: string, isSamePerson = false) => {
  const response = await api.post(`/clients/${clientId}/assign-subject/${subjectId}`, { isSamePerson });
  return response.data;
};

export const deleteSubject = async (id: string) => {
  const response = await api.delete(`/subjects/${id}`);
  return response.data;
};

export const fetchSubjectsByUser = async () => {
  const response = await api.get(`/subjects/me`);
  return response.data;
};