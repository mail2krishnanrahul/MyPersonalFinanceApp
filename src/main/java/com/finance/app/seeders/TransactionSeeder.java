package com.finance.app.seeders;

import com.finance.app.models.Account;
import com.finance.app.models.Transaction;
import com.finance.app.models.User;
import com.finance.app.repositories.AccountRepository;
import com.finance.app.repositories.TransactionRepository;
import com.finance.app.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * Seeds the database with 500 fake transactions on startup if the table is
 * empty.
 * Generates messy raw descriptions typical of real bank transaction data.
 */
@Component
public class TransactionSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(TransactionSeeder.class);
    private static final int TRANSACTION_COUNT = 500;

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final Random random = new Random();

    // Messy raw description templates typical of bank statements
    private static final String[] RAW_DESCRIPTIONS = {
            "VZW*WEBSITE PMT",
            "7-ELEVEN 0042",
            "WLMRT ST#1024",
            "AMZN MKTP US*2K4H91JF0",
            "NETFLIX.COM",
            "SPOTIFY USA",
            "UBER *TRIP",
            "LYFT *RIDE",
            "SHELL OIL 57442136",
            "CHEVRON 0012345",
            "COSTCO WHSE #1234",
            "TARGET 00012345",
            "WALGREENS #9876",
            "CVS/PHARMACY #4521",
            "STARBUCKS 12345",
            "DUNKIN #351423",
            "MCDONALD'S F12345",
            "CHICK-FIL-A #01234",
            "CHIPOTLE 1234",
            "DOMINOS 12345",
            "GRUBHUB*SEAMLESS",
            "DOORDASH*DASHPASS",
            "INSTACART",
            "WHOLEFDS MKT 10234",
            "TRADER JOE'S #123",
            "KROGER #12345",
            "PUBLIX #1234",
            "ALDI 76001",
            "HOME DEPOT #1234",
            "LOWES #01234",
            "BESTBUY 00000123",
            "APPLE.COM/BILL",
            "GOOGLE *CLOUD",
            "MSFT *XBOX",
            "STEAM PURCHASE",
            "PLAYSTATION NETWORK",
            "HULU*SUBSCRIPTION",
            "DISNEY PLUS",
            "HBO MAX",
            "PRIME VIDEO*1K2J3L",
            "ATT*BILL PMT",
            "TMOBILE*POSTPAID",
            "COMCAST CABLE",
            "DUKE ENERGY",
            "WATER UTILITY PMT",
            "STATE FARM INS",
            "GEICO *AUTO",
            "PROGRESSIVE INS",
            "PLANET FITNESS",
            "LA FITNESS",
            "PELOTON*MEMBERSHIP",
            "ADOBE *CREATIVE",
            "DROPBOX*PLAN",
            "ZOOM.US",
            "SLACK TECH",
            "GITHUB INC",
            "AWS *SERVICES",
            "DIGITALOCEAN",
            "HEROKU",
            "VENMO *PAYMENT",
            "PAYPAL *TRANSFER",
            "ZELLE *SENT",
            "SQ *CASH APP",
            "USPS PO 123456789",
            "FEDEX 789012345",
            "UPS*123456789",
            "DHL EXPRESS",
            "AMAZON PRIME*2K5J6L",
            "EBAY O*12-34567-89012",
            "ETSY.COM",
            "WAYFAIR*ORDER",
            "IKEA US ONLINE",
            "BED BATH #1234",
            "MACYS.COM",
            "NORDSTROM #123",
            "KOHLS #0123",
            "TJ MAXX #1234",
            "ROSS STORES #123",
            "OLD NAVY #12345",
            "GAP ONLINE",
            "NIKE.COM",
            "ADIDAS US",
            "FOOTLOCKER #1234",
            "SEPHORA #123",
            "ULTA #1234",
            "PETCO #12345",
            "PETSMART #1234",
            "CHEWY.COM",
            "AUTOZONE #12345",
            "OREILLY AUTO #1234",
            "JIFFY LUBE #1234",
            "DISCOUNT TIRE CO",
            "AAA MEMBERSHIP",
            "MARRIOTT HTL*STAY",
            "HILTON HOTEL",
            "AIRBNB*RESERVATION",
            "VRBO*BOOKING",
            "EXPEDIA*FLIGHT",
            "DELTA AIR*TICKET",
            "SOUTHWEST AIR"
    };

    // Categories for transactions
    private static final String[] CATEGORIES = {
            "Utilities",
            "Groceries",
            "Dining",
            "Transportation",
            "Entertainment",
            "Shopping",
            "Healthcare",
            "Insurance",
            "Subscriptions",
            "Travel",
            "Gas",
            "Personal Care",
            "Pets",
            "Home",
            "Electronics",
            "Clothing",
            "Fitness",
            "Transfers",
            null // Some transactions may be uncategorized
    };

    public TransactionSeeder(TransactionRepository transactionRepository,
            AccountRepository accountRepository,
            UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (transactionRepository.count() > 0) {
            logger.info("Transactions table already has data. Skipping seeding.");
            return;
        }

        logger.info("Seeding {} transactions...", TRANSACTION_COUNT);

        // Create test user if not exists
        User testUser = getOrCreateTestUser();

        // Create test account if not exists
        Account testAccount = getOrCreateTestAccount(testUser);

        // Generate and save transactions
        List<Transaction> transactions = generateTransactions(testAccount);
        transactionRepository.saveAll(transactions);

        logger.info("Successfully seeded {} transactions.", transactions.size());
    }

    private User getOrCreateTestUser() {
        return userRepository.findByEmail("test@example.com")
                .orElseGet(() -> {
                    User user = new User();
                    user.setEmail("test@example.com");
                    user.setName("Test User");
                    user.setCreatedBy("TransactionSeeder");
                    return userRepository.save(user);
                });
    }

    private Account getOrCreateTestAccount(User user) {
        List<Account> existingAccounts = accountRepository.findByUserId(user.getId());
        if (!existingAccounts.isEmpty()) {
            return existingAccounts.get(0);
        }

        Account account = new Account();
        account.setUser(user);
        account.setAccountName("Primary Checking");
        account.setBalance(new BigDecimal("5000.00"));
        account.setCreatedBy("TransactionSeeder");
        return accountRepository.save(account);
    }

    private List<Transaction> generateTransactions(Account account) {
        List<Transaction> transactions = new ArrayList<>(TRANSACTION_COUNT);
        LocalDateTime baseDate = LocalDateTime.now().minusDays(365);

        for (int i = 0; i < TRANSACTION_COUNT; i++) {
            Transaction transaction = new Transaction();
            transaction.setAccount(account);

            // Generate messy raw description
            String rawDescription = generateRawDescription();
            transaction.setRawDescription(rawDescription);

            // Leave clean description null - to be filled by AI later
            transaction.setCleanDescription(null);

            // Randomly assign category (some null to simulate uncategorized)
            String category = CATEGORIES[random.nextInt(CATEGORIES.length)];
            transaction.setCategory(category);

            // Generate random amount between -500 and -5 (expenses) or +100 to +3000
            // (income)
            BigDecimal amount = generateAmount();
            transaction.setAmount(amount);

            // Generate random transaction date within the past year
            LocalDateTime transactionDate = baseDate.plusDays(random.nextInt(365))
                    .plusHours(random.nextInt(24))
                    .plusMinutes(random.nextInt(60));
            transaction.setTransactionDate(transactionDate);

            transaction.setCreatedBy("TransactionSeeder");

            transactions.add(transaction);
        }

        return transactions;
    }

    private String generateRawDescription() {
        String baseDescription = RAW_DESCRIPTIONS[random.nextInt(RAW_DESCRIPTIONS.length)];

        // Add some randomization to make descriptions more realistic
        StringBuilder sb = new StringBuilder(baseDescription);

        // Sometimes add random numbers
        if (random.nextBoolean()) {
            sb.append(" ").append(String.format("%05d", random.nextInt(100000)));
        }

        // Sometimes add location codes
        if (random.nextInt(3) == 0) {
            sb.append(" ").append(generateLocationCode());
        }

        return sb.toString();
    }

    private String generateLocationCode() {
        String[] states = { "CA", "NY", "TX", "FL", "WA", "IL", "PA", "OH", "GA", "NC" };
        String[] cities = { "SAN FRAN", "NEW YORK", "HOUSTON", "MIAMI", "SEATTLE",
                "CHICAGO", "PHILA", "COLUMBUS", "ATLANTA", "CHARLOTTE" };

        int idx = random.nextInt(states.length);
        return cities[idx] + " " + states[idx];
    }

    private BigDecimal generateAmount() {
        // 80% expenses, 20% income
        if (random.nextInt(5) < 4) {
            // Expense: -5.00 to -500.00
            double expense = -(5 + random.nextDouble() * 495);
            return BigDecimal.valueOf(expense).setScale(2, RoundingMode.HALF_UP);
        } else {
            // Income: +100.00 to +3000.00
            double income = 100 + random.nextDouble() * 2900;
            return BigDecimal.valueOf(income).setScale(2, RoundingMode.HALF_UP);
        }
    }
}
