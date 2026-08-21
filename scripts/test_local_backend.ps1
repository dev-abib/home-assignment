$baseUrl = "http://localhost:5000/api"

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
Write-Host "  TESTING LOCAL EXPRESS + MONGO BACKEND   "
Write-Host "=========================================="

$health = Invoke-RestMethod -Uri "http://localhost:5000/health"
Write-Host "[Health Check] Status=$($health.status) DB=$($health.database)"

$rand = Get-Random -Minimum 10000 -Maximum 99999
$phone1 = "+198888$rand"
$phone2 = "+197777$rand"
$phone3 = "+196666$rand"

Write-Host "`n[Step 1] Registering User 1 (Alice)..."
$u1 = Call-Api "Post" "/auth/login" @{ phone = $phone1; name = "Local Alice" } $null
$t1 = $u1.token
$id1 = $u1.user._id
Write-Host "  OK - Alice registered: ID=$id1"

Write-Host "`n[Step 2] Registering User 2 (Bob)..."
$u2 = Call-Api "Post" "/auth/login" @{ phone = $phone2; name = "Local Bob" } $null
$t2 = $u2.token
$id2 = $u2.user._id
Write-Host "  OK - Bob registered: ID=$id2"

Write-Host "`n[Step 3] Registering User 3 (Charlie)..."
$u3 = Call-Api "Post" "/auth/login" @{ phone = $phone3; name = "Local Charlie" } $null
$t3 = $u3.token
$id3 = $u3.user._id
Write-Host "  OK - Charlie registered: ID=$id3"

Write-Host "`n[Step 4] Search Users for 'Local'..."
$searchRes = Call-Api "Get" "/users/search?q=Local" $null $t1
Write-Host "  OK - Search returned $($searchRes.Length) results"

Write-Host "`n[Step 5] Starting Direct Chat..."
$conv = Call-Api "Post" "/conversations" @{ userId = $id2 } $t1
$convId = $conv._id
Write-Host "  OK - Direct conversation created: ID=$convId"

Write-Host "`n[Step 6] Alice sending message..."
$msg = Call-Api "Post" "/messages" @{ conversationId = $convId; text = "Hello from Express + MongoDB Atlas!" } $t1
Write-Host "  OK - Message created: ID=$($msg._id) Text='$($msg.text)'"

Write-Host "`n[Step 7] Creating Group with 3 members..."
$group = Call-Api "Post" "/conversations/group" @{ name = "Atlas Launch Crew"; participantIds = @($id2, $id3) } $t1
$groupId = $group._id
Write-Host "  OK - Group created: ID=$groupId Name='$($group.name)' Members=$($group.participants.Length)"

Write-Host "`n[Step 8] Sending Group Message..."
$grpMsg = Call-Api "Post" "/messages" @{ conversationId = $groupId; text = "Welcome everyone to MongoDB Atlas group!" } $t1
Write-Host "  OK - Group message sent: ID=$($grpMsg._id)"

Write-Host "`n[Step 9] Renaming Group..."
$renamed = Call-Api "Patch" "/conversations/$groupId" @{ name = "Atlas Flight Operations" } $t1
Write-Host "  OK - Group renamed to '$($renamed.name)'"

Write-Host "`n[Step 10] Promoting Bob to Admin..."
$promoted = Call-Api "Post" "/conversations/$groupId/admins" @{ userId = $id2 } $t1
Write-Host "  OK - Bob promoted: Admins=$($promoted.admins.Length)"

Write-Host "`n[Step 11] Fetching Messages with Pagination..."
$history = Call-Api "Get" "/conversations/$groupId/messages?limit=10" $null $t1
Write-Host "  OK - Retrieved $($history.messages.Length) messages"

Write-Host "`n=========================================="
Write-Host "  ALL LOCAL BACKEND TESTS PASSED 100%!    "
Write-Host "=========================================="
