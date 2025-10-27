"use client"

import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { useState } from "react"

interface CopyInviteCodeButtonProps {
  inviteCode: string | null
}

export function CopyInviteCodeButton({ inviteCode }: CopyInviteCodeButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (inviteCode) {
      await navigator.clipboard.writeText(inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Button
      onClick={handleCopy}
      variant="outline"
      className="flex items-center"
    >
      <Copy className="h-4 w-4 mr-2" />
      {copied ? "Copied!" : "Copy"}
    </Button>
  )
}
