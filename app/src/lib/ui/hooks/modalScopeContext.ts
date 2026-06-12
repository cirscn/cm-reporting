import { createContext } from 'react'

export type ModalContainerGetter = () => HTMLElement

export const ModalContainerContext = createContext<ModalContainerGetter | null>(null)
