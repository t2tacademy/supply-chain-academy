import { google } from 'googleapis'
import type { OrderSelection } from './supabase'

const CATEGORY_ENV_MAP: Record<string, string> = {
  'supply-chain':      'SUPPLY_CHAIN',
  'manufactura':       'MANUFACTURA',
  'stocks':            'STOCKS',
  'sop':               'SOP',
  'demand-planner':    'DEMAND_PLANNER',
  'supply-planning':   'SUPPLY_PLANNING',
  'planif-materiales': 'PLANIF_MATERIALES',
}

function getDrive() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/drive'],
  })
  return google.drive({ version: 'v3', auth })
}

export function getFolderIdForSelection(sel: OrderSelection): string | null {
  if (sel.tier === 'upgrade') {
    if (sel.categoryId === 'starter-to-pro')  return process.env.DRIVE_UPGRADE_SP  ?? null
    if (sel.categoryId === 'pro-to-expert')   return process.env.DRIVE_UPGRADE_PE  ?? null
    return null
  }
  const cat = CATEGORY_ENV_MAP[sel.categoryId]
  if (!cat) return null
  const tier = sel.tier.toUpperCase()
  // lib/courses.ts usa nombres cortos (DRIVE_SC_STARTER = link a la carpeta); si no está
  // el ID con nombre largo, se saca el ID de ese link para que ambos esquemas funcionen
  return process.env[`DRIVE_${cat}_${tier}`]
    ?? folderIdFromLink(process.env[`DRIVE_${CATEGORY_SHORT_ENV[sel.categoryId]}_${tier}`])
}

const CATEGORY_SHORT_ENV: Record<string, string> = {
  'supply-chain':      'SC',
  'manufactura':       'MAN',
  'stocks':            'STK',
  'sop':               'SOP',
  'demand-planner':    'DP',
  'supply-planning':   'SP',
  'planif-materiales': 'PM',
}

function folderIdFromLink(value: string | undefined): string | null {
  if (!value) return null
  const m = value.match(/\/folders\/([\w-]+)/) ?? value.match(/[?&]id=([\w-]+)/)
  if (m) return m[1]
  return /^[\w-]{20,}$/.test(value) ? value : null
}

export async function shareFolder(folderId: string, email: string): Promise<string> {
  const drive = getDrive()
  const res = await drive.permissions.create({
    fileId: folderId,
    requestBody: { type: 'user', role: 'reader', emailAddress: email },
    fields: 'id',
    sendNotificationEmail: false,
  })
  return res.data.id!
}

export async function revokeAccess(folderId: string, permissionId: string): Promise<void> {
  const drive = getDrive()
  await drive.permissions.delete({ fileId: folderId, permissionId })
}

export async function grantOrderAccess(
  selections: OrderSelection[],
  email: string
): Promise<Record<string, string>> {
  const permissionIds: Record<string, string> = {}
  const seen = new Set<string>()

  for (const sel of selections) {
    const folderId = getFolderIdForSelection(sel)
    if (!folderId || seen.has(folderId)) continue
    seen.add(folderId)
    try {
      const permId = await shareFolder(folderId, email)
      permissionIds[folderId] = permId
    } catch (err) {
      console.error(`Error sharing folder ${folderId} with ${email}:`, err)
    }
  }

  return permissionIds
}

export async function revokeOrderAccess(
  permissionIds: Record<string, string>
): Promise<void> {
  for (const [folderId, permId] of Object.entries(permissionIds)) {
    try {
      await revokeAccess(folderId, permId)
    } catch (err) {
      console.error(`Error revoking permission ${permId} from folder ${folderId}:`, err)
    }
  }
}
