import { Label } from "./Label"

export class LabelSettings {
    id!: number
    userId!: number
    label!: Label
    color!: string
    createdAt?: string
    updatedAt?: string
    glue?: any[]
}