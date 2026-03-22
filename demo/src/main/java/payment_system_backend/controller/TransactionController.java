package payment_system_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import payment_system_backend.model.Transaction;
import payment_system_backend.repository.TransactionRepository;
import payment_system_backend.service.TransactionService;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/transaction")
@CrossOrigin(origins = "http://localhost:3000")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private TransactionRepository transactionRepo;

    @PostMapping("/send")
    public String sendMoney(@RequestParam("senderId") Long senderId,
                            @RequestParam("receiverId") Long receiverId,
                            @RequestParam("amount") double amount){

        transactionService.sendMoney(senderId, receiverId, amount);

        return "Payment Successful";
    }

    /** Returns all sent + received transactions for a user, newest first */
    @GetMapping("/history/{userId}")
    public List<Transaction> history(@PathVariable("userId") Long userId) {
        List<Transaction> all = new ArrayList<>();
        all.addAll(transactionRepo.findBySenderId(userId));
        all.addAll(transactionRepo.findByReceiverId(userId));
        all.sort(Comparator.comparing(Transaction::getTime,
                Comparator.nullsLast(Comparator.reverseOrder())));
        return all;
    }

    @PostMapping("/retry/{id}")
    public String retryPayment(@PathVariable("id") Long id){
        transactionService.retryTransaction(id);
        return "Transaction retried";
    }
}