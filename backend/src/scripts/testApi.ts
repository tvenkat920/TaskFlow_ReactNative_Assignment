async function testLiveApi() {
  const baseURL = 'http://localhost:5000/api';
  console.log('[TestLiveApi] Connecting to:', baseURL);

  // 1. Health Check
  const healthRes = await fetch(`${baseURL}/health`);
  const healthData = (await healthRes.json()) as any;
  console.log('[TestLiveApi] Health check:', healthData);

  // 2. Register
  const email = `test.${Date.now()}@example.com`;
  const regRes = await fetch(`${baseURL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Alex Morgan',
      email,
      password: 'Password123!',
      confirmPassword: 'Password123!',
    }),
  });
  const regData = (await regRes.json()) as any;
  console.log('[TestLiveApi] Registered user:', regData.data?.user);
  const token = regData.data?.token;

  // 3. Create Task
  const taskRes = await fetch(`${baseURL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: 'Launch TaskFlow Mobile Production App',
      description: 'End-to-end verified on live running server',
      priority: 'Urgent',
      category: 'Work',
      dueAt: new Date(Date.now() + 86400000).toISOString(),
    }),
  });
  const taskData = (await taskRes.json()) as any;
  console.log('[TestLiveApi] Created task:', taskData.data?.task?.title, 'Priority:', taskData.data?.task?.priority);

  // 4. Fetch Tasks
  const listRes = await fetch(`${baseURL}/tasks`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const listData = (await listRes.json()) as any;
  console.log('[TestLiveApi] Fetched tasks count:', listData.data?.tasks?.length);
  console.log('[TestLiveApi] Dashboard stats:', listData.data?.stats);
}

testLiveApi().catch(console.error);
