# QR Code & PDF Testing Guide

## Quick Testing Steps

### 1. Test PDF Generation

#### Daily Pass PDF
```bash
# Login as student
# Apply for a daily pass
# Get it approved by hostel staff
# Download PDF
# Verify:
- Header shows "Official Daily Gate Pass"
- Status badge shows "✓ APPROVED"
- QR code is large (180x180) and centered
- QR code is in a bordered card
- Pass ID shown below QR
- "Scan at Security Gate" instruction visible
```

#### Long Leave PDF
```bash
# Login as student
# Apply for long leave
# Get it approved by coordinator and hostel staff
# Download PDF
# Verify:
- Header shows "Official Long Leave Gate Pass"
- Status badge shows "✓ APPROVED"
- Both coordinator and hostel approvals shown
- QR code is large (180x180) and centered
- QR code is in a bordered card
- Pass ID shown below QR
- "Scan at Security Gate" instruction visible
```

### 2. Test QR Modal (Student Dashboard)

```bash
# Login as student
# Navigate to "My Passes"
# Find an approved pass
# Click "View QR" button

# Verify Modal:
✓ Modal opens with backdrop blur
✓ Large QR code (256x256) displayed
✓ Pass ID shown below QR
✓ Student name displayed
✓ Pass type shown (Daily Pass / Long Leave)
✓ Status badge visible
✓ Destination shown
✓ Security instructions visible
✓ ESC key closes modal
✓ Clicking outside closes modal
✓ Close button works
```

### 3. Test QR Scanning (Security)

```bash
# Login as security staff
# Navigate to "QR Scanner"
# Scan QR from:
  - Student's phone (modal)
  - Downloaded PDF
  - Printed PDF

# Verify:
✓ QR scans successfully
✓ Pass details displayed
✓ Student information shown
✓ Pass status verified
✓ Can record entry/exit
```

---

## Visual Verification Checklist

### PDF Layout
- [ ] Header is blue with white text
- [ ] System title is prominent (20pt)
- [ ] Status badge is green and large
- [ ] QR section has gray background card
- [ ] QR code is centered in card
- [ ] QR code is 180x180 pixels
- [ ] Pass ID is below QR in blue
- [ ] "Scan at Security Gate" is bold
- [ ] Footer has system info

### QR Modal
- [ ] Modal has gradient blue header
- [ ] QR code is in white card with shadow
- [ ] QR code is 256x256 pixels
- [ ] Pass details section is clear
- [ ] Security instructions in amber box
- [ ] Close button in header works
- [ ] Bottom close button works
- [ ] Responsive on mobile

---

## Common Issues & Solutions

### Issue: QR Code Not Generating
**Solution**: 
- Check pass status is APPROVED
- Verify QR token exists in database
- Check server logs for errors

### Issue: PDF Download Fails
**Solution**:
- Ensure pass is approved
- Check PDF directory permissions
- Verify pdfkit is installed

### Issue: QR Modal Not Opening
**Solution**:
- Check browser console for errors
- Verify QR data is loaded
- Check modal state management

### Issue: QR Code Not Scanning
**Solution**:
- Ensure QR code is not blurry
- Check lighting conditions
- Try different scanner app
- Verify QR token is active

---

## Test Data

### Sample Daily Pass
```javascript
{
  pass_type: 'DAILY',
  pass_date: '2026-06-05',
  exit_time: '14:00',
  expected_return_time: '18:00',
  destination: 'City Mall',
  reason: 'Shopping',
  status: 'APPROVED'
}
```

### Sample Long Leave
```javascript
{
  pass_type: 'LONG_LEAVE',
  leaving_date: '2026-06-10',
  returning_date: '2026-06-15',
  destination: 'Home Town',
  reason: 'Family Function',
  parent_contact: '9876543210',
  status: 'APPROVED'
}
```

---

## Performance Testing

### PDF Generation Time
- Daily Pass: < 2 seconds
- Long Leave: < 2 seconds

### QR Modal Load Time
- First load: < 1 second
- Subsequent loads: Instant (cached)

### QR Scan Time
- Average: < 1 second
- Maximum: 3 seconds

---

## Browser Compatibility

### Tested Browsers
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Mobile Browsers
- ✅ Chrome Mobile
- ✅ Safari iOS
- ✅ Samsung Internet

---

## Security Testing

### QR Token Validation
- [ ] Invalid token rejected
- [ ] Expired token rejected
- [ ] Inactive token rejected
- [ ] Valid token accepted

### PDF Security
- [ ] Only approved passes generate PDF
- [ ] Students can only download own PDFs
- [ ] Hostel staff can download any PDF
- [ ] Admin can download any PDF

---

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab through modal elements
- [ ] ESC closes modal
- [ ] Enter activates buttons
- [ ] Focus visible on all elements

### Screen Reader
- [ ] Modal title announced
- [ ] QR code has alt text
- [ ] Instructions readable
- [ ] Close button labeled

---

## Load Testing

### Concurrent PDF Generation
```bash
# Test 10 simultaneous PDF generations
# Expected: All succeed within 5 seconds
```

### Concurrent QR Scans
```bash
# Test 20 simultaneous QR scans
# Expected: All succeed within 3 seconds
```

---

## Regression Testing

After any changes, verify:
- [ ] Existing PDFs still valid
- [ ] Old QR codes still scan
- [ ] Modal still works
- [ ] No console errors
- [ ] No visual glitches

---

## Sign-off Checklist

Before deploying to production:
- [ ] All PDF layouts verified
- [ ] QR codes scan reliably
- [ ] Modal works on all devices
- [ ] Security scanning works
- [ ] Performance acceptable
- [ ] No console errors
- [ ] Documentation updated
- [ ] Team trained on new features

---

## Contact for Issues

- **PDF Issues**: Check server logs, verify pdfkit installation
- **QR Issues**: Check qrcode package, verify token generation
- **Modal Issues**: Check React state, verify component imports
- **Scanning Issues**: Test with multiple devices, check token validation

---

## Quick Commands

### Restart Server
```bash
cd server
npm run dev
```

### Restart Client
```bash
cd client
npm run dev
```

### Check Logs
```bash
# Server logs
tail -f server/logs/app.log

# Check PDF directory
ls -la server/src/pdf/
```

### Database Check
```sql
-- Check QR tokens
SELECT * FROM qr_tokens WHERE is_active = true;

-- Check approved passes
SELECT * FROM passes WHERE status = 'APPROVED';
```

---

## Success Criteria

✅ **PDF Generation**: Professional layout with prominent QR code
✅ **QR Modal**: Smooth, responsive, easy to use
✅ **QR Scanning**: Fast, reliable, accurate
✅ **User Experience**: Intuitive, clear, efficient
✅ **Performance**: Fast load times, no lag
✅ **Security**: Proper validation, access control
✅ **Accessibility**: Keyboard navigation, screen reader support

---

## Next Steps After Testing

1. ✅ Verify all tests pass
2. ✅ Document any issues found
3. ✅ Fix critical issues
4. ✅ Re-test after fixes
5. ✅ Get stakeholder approval
6. ✅ Deploy to production
7. ✅ Monitor for issues
8. ✅ Gather user feedback

---

**Remember**: The QR code should be one of the most visible elements in both PDFs and the digital interface!
