import { AppShell } from '@/components/layout/AppShell'
import { UserMenu } from '@/components/layout/UserMenu'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let userMenu: React.ReactNode = null

  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('username, avatar_url')
      .eq('id', user.id)
      .single()

    if (profile) {
      userMenu = (
        <UserMenu username={profile.username} avatarUrl={profile.avatar_url} />
      )
    }
  }

  return <AppShell userMenu={userMenu}>{children}</AppShell>
}
