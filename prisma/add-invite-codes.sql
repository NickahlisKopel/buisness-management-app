-- Add invite codes to organizations that don't have them
-- Run this with: npx prisma db execute --file ./prisma/add-invite-codes.sql --schema ./prisma/schema.prisma

UPDATE organizations 
SET inviteCode = (
  CASE 
    WHEN id = (SELECT id FROM organizations ORDER BY createdAt LIMIT 1 OFFSET 0) THEN 'ABC12345'
    WHEN id = (SELECT id FROM organizations ORDER BY createdAt LIMIT 1 OFFSET 1) THEN 'XYZ67890'
    WHEN id = (SELECT id FROM organizations ORDER BY createdAt LIMIT 1 OFFSET 2) THEN 'QWE34567'
    ELSE substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', abs(random()) % 32 + 1, 1) ||
         substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', abs(random()) % 32 + 1, 1) ||
         substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', abs(random()) % 32 + 1, 1) ||
         substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', abs(random()) % 32 + 1, 1) ||
         substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', abs(random()) % 32 + 1, 1) ||
         substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', abs(random()) % 32 + 1, 1) ||
         substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', abs(random()) % 32 + 1, 1) ||
         substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', abs(random()) % 32 + 1, 1)
  END
)
WHERE inviteCode IS NULL;
