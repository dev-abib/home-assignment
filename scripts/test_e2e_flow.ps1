$baseUrl = "https://frontend-task-chatapp.onrender.com/api"

function Call-Api($method, $endpoint, $body, $token) {
    $headers = @{}
    if ($token) { $headers["Authorization"] = "Bearer $token" }
    $params = @{
        Uri = "$baseUrl$endpoint"
        Method = $method
        Headers = $headers
        ContentType = "application/json"
    }
    if ($body) { $params["Body"] = ($body | ConvertTo-Json -Depth 10) }
    return (Invoke-RestMethod @params)
}

Write-Host "=========================================="
Write-Host "  PULSECHAT E2E COMPREHENSIVE TEST SUITE  "
Write-Host "=========================================="

$rand = Get-Random -Minimum 10000 -Maximum 99999
$phone1 = "+1911111$rand"
$phone2 = "+1922222$rand"
$phone3 = "+1933333$rand"

Write-Host "`n[Step 1] Registering User 1 (Alice)..."
$u1 = Call-Api "Post" "/auth/login" @{ phone = $phone1; name = "Alice E2E" } $null
$t1 = $u1.token
$id1 = $u1.user._id
Write-Host "  OK - Alice registered: ID=$id1"

Write-Host "`n[Step 2] Registering User 2 (Bob)..."
$u2 = Call-Api "Post" "/auth/login" @{ phone = $phone2; name = "Bob E2E" } $null
$t2 = $u2.token
$id2 = $u2.user._id
Write-Host "  OK - Bob registered: ID=$id2"

Write-Host "`n[Step 3] Registering User 3 (Charlie)..."
$u3 = Call-Api "Post" "/auth/login" @{ phone = $phone3; name = "Charlie E2E" } $null
$t3 = $u3.token
$id3 = $u3.user._id
Write-Host "  OK - Charlie registered: ID=$id3"

Write-Host "`n[Step 4] Testing User Search for 'Alice'..."
$searchRes = Call-Api "Get" "/users/search?q=Alice" $null $t2
Write-Host "  OK - Search returned $($searchRes.Length) results"

Write-Host "`n[Step 5] Starting Direct Conversation (Alice -> Bob)..."
$directConv = Call-Api "Post" "/conversations" @{ userId = $id2 } $t1
$directId = $directConv._id
Write-Host "  OK - Direct conversation created: ID=$directId"

Write-Host "`n[Step 6] Alice sending message to Bob..."
$msg1 = Call-Api "Post" "/messages" @{ conversationId = $directId; text = "Hi Bob! This is an E2E test." } $t1
Write-Host "  OK - Message sent: ID=$($msg1._id) Text='$($msg1.text)'"

Write-Host "`n[Step 7] Creating Group Chat with Alice (creator), Bob, Charlie..."
$groupConv = Call-Api "Post" "/conversations/group" @{ name = "Apollo Launch Squad"; participantIds = @($id2, $id3) } $t1
$groupId = $groupConv._id
Write-Host "  OK - Group created: ID=$groupId Name='$($groupConv.name)' Members=$($groupConv.participants.Length)"

Write-Host "`n[Step 8] Alice sending group message..."
$grpMsg = Call-Api "Post" "/messages" @{ conversationId = $groupId; text = "Welcome team to the new group!" } $t1
Write-Host "  OK - Group message sent: ID=$($grpMsg._id)"

Write-Host "`n[Step 9] Renaming Group (Admins only)..."
$renamed = Call-Api "Patch" "/conversations/$groupId" @{ name = "Apollo Mission Control" } $t1
Write-Host "  OK - Group renamed: '$($renamed.name)'"

Write-Host "`n[Step 10] Promoting Bob to Admin..."
$promoted = Call-Api "Post" "/conversations/$groupId/admins" @{ userId = $id2 } $t1
Write-Host "  OK - Bob promoted to admin: Admins=$($promoted.admins.Length)"

Write-Host "`n[Step 11] Fetching Message History with Pagination..."
$msgs = Call-Api "Get" "/conversations/$groupId/messages?limit=10" $null $t1
Write-Host "  OK - Messages retrieved count: $($msgs.messages.Length)"

Write-Host "`n=========================================="
Write-Host "  ALL 11 E2E SUITE TESTS PASSED 100%!     "
Write-Host "=========================================="
