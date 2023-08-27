export const shapeFields = ['x', 'y', 'type', 'size', 'r', 'g', 'b', 'isDraggable'] as const
export const dataDividerCharCode = 0xA
export const dataDividerChar = String.fromCharCode(dataDividerCharCode)
export const excludeCharacters = new Set([dataDividerCharCode])
