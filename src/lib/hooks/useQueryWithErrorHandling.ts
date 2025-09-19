'use client';

import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { useApiErrorHandler } from '@/hooks/useApiErrorHandler';

/**
 * Enhanced useQuery with automatic error handling
 */
export function useQueryWithErrorHandling<TData = unknown, TError = unknown>(
  options: UseQueryOptions<TData, TError> & {
    errorContext?: string;
    showErrorToast?: boolean;
  }
) {
  const { handleError } = useApiErrorHandler();
  const { errorContext, showErrorToast = true, ...queryOptions } = options;

  const query = useQuery(queryOptions);
  
  // Handle errors when they occur
  if (query.error && showErrorToast) {
    handleError(query.error, errorContext);
  }
  
  return query;
}

/**
 * Enhanced useMutation with automatic error handling
 */
export function useMutationWithErrorHandling<TData = unknown, TError = unknown, TVariables = unknown>(
  options: UseMutationOptions<TData, TError, TVariables> & {
    errorContext?: string;
    successMessage?: string;
    loadingMessage?: string;
    showErrorToast?: boolean;
    showSuccessToast?: boolean;
    showLoadingToast?: boolean;
  }
) {
  const { handleError, handleSuccess, handleLoading } = useApiErrorHandler();
  const {
    errorContext,
    successMessage,
    loadingMessage,
    showErrorToast = true,
    showSuccessToast = true,
    showLoadingToast = false,
    ...mutationOptions
  } = options;

  return useMutation({
    ...mutationOptions,
    onMutate: (variables) => {
      if (showLoadingToast && loadingMessage) {
        handleLoading(loadingMessage, errorContext);
      }
      return mutationOptions.onMutate?.(variables);
    },
    onError: (error, variables, context) => {
      if (showErrorToast) {
        handleError(error, errorContext);
      }
      mutationOptions.onError?.(error, variables, context);
    },
    onSuccess: (data, variables, context) => {
      if (showSuccessToast && successMessage) {
        handleSuccess(successMessage, errorContext);
      }
      mutationOptions.onSuccess?.(data, variables, context);
    },
  });
}

/**
 * Utility function to create error handling options for TanStack Query
 */
export function createErrorHandlingOptions(context: string) {
  return {
    errorContext: context,
    showErrorToast: true,
    showSuccessToast: true,
    showLoadingToast: false,
  };
}
