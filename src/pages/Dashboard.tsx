import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Link } from 'react-router-dom';
import type {
  Transaction,
  TransactionType,
} from '../types/database';

export const Dashboard = () => {
  const [activeTab, setActiveTab] =
    useState<TransactionType>('expense');

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');

  const [categoryOpen, setCategoryOpen] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);

  const [balance, setBalance] = useState(0);
  const [balanceInput, setBalanceInput] = useState('0');

  const [currency, setCurrency] = useState('UAH');

  const [loading, setLoading] = useState(true);

  const expenseCategories = [
    'Транспорт',
    'Продукти',
    "Здоров'я",
    'Алкоголь',
    'Розваги',
    'Все для дому',
    'Техніка',
    "Комуналка, зв'язок",
    'Спорт, хобі',
    'Навчання',
    'Інше',
  ];

  const incomeCategories = [
    'ЗП',
    'Дод. прибуток',
    'Подарунок',
    'Інше',
  ];

  const categories =
    activeTab === 'expense'
      ? expenseCategories
      : incomeCategories;

  useEffect(() => {
    const loadData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const { data: profile, error: profileError } =
        await supabase
          .from('profiles')
          .select(
            'balance, currency'
          )
          .eq('id', user.id)
          .single();

      if (profileError) {
        console.log(profileError.message);
      }

      if (profile) {
        const profileBalance = Number(profile.balance || 0);

        setBalance(profileBalance);
        setBalanceInput(String(profileBalance));
        setCurrency(profile.currency || 'UAH');
      }

      await loadTransactions(user.id);

      setLoading(false);
    };

    loadData();
  }, []);

  const loadTransactions = async (id: string) => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', id)
      .order('date', {
        ascending: false,
      });

    if (error) {
      console.log('Transactions:', error.message);
      return;
    }

    setTransactions(data || []);
  };


  const saveBalance = async () => {
    if (!userId) return;

    const newBalance = Number(balanceInput);

    if (Number.isNaN(newBalance) || newBalance < 0) {
      alert('Введіть правильний баланс');
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      alert(error.message);
      return;
    }

    setBalance(newBalance);
  };


  const addTransaction = async () => {
    if (!userId) return;

    if (!description || !category || !amount) {
      alert('Заповніть всі поля');
      return;
    }

    const numberAmount = Number(amount);

    if (numberAmount <= 0) {
      alert('Введіть правильну суму');
      return;
    }

    const today = new Date()
      .toISOString()
      .split('T')[0];

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: activeTab,
        description,
        category,
        amount: numberAmount,
        date: today,
      })
      .select()
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    setTransactions((old) => [
      data,
      ...old,
    ]);

    const newBalance =
      activeTab === 'expense'
        ? balance - numberAmount
        : balance + numberAmount;

    const { error: balanceError } = await supabase
      .from('profiles')
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (!balanceError) {
      setBalance(newBalance);
      setBalanceInput(String(newBalance));
    }

    clearInputs();
  };


  const deleteTransaction = async (
    transaction: Transaction  
  ) => {
    if (!userId) return;

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transaction.id)
      .eq('user_id', userId);

    if (error) {
      alert(error.message);
      return;
    }

    setTransactions((old) =>
      old.filter(
        (item) => item.id !== transaction.id
      )
    );

    let newBalance = balance;

    if (transaction.type === 'expense') {
      newBalance += Number(transaction.amount);
    } else {
      newBalance -= Number(transaction.amount);
    }

    await supabase
      .from('profiles')
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    setBalance(newBalance);
    setBalanceInput(String(newBalance));
  };


  const clearInputs = () => {
    setDescription('');
    setCategory('');
    setAmount('');
    setCategoryOpen(false);
  };



  const visibleTransactions =
    transactions.filter(
      (item) => item.type === activeTab
    );



  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      'uk-UA'
    );
  };


  const monthNames = [
    'СІЧЕНЬ',
    'ЛЮТИЙ',
    'БЕРЕЗЕНЬ',
    'КВІТЕНЬ',
    'ТРАВЕНЬ',
    'ЧЕРВЕНЬ',
    'ЛИПЕНЬ',
    'СЕРПЕНЬ',
    'ВЕРЕСЕНЬ',
    'ЖОВТЕНЬ',
    'ЛИСТОПАД',
    'ГРУДЕНЬ',
  ];

  const summary = visibleTransactions.reduce<
    Record<string, number>
  >((result, transaction) => {
    const month =
      monthNames[
        new Date(transaction.date).getMonth()
      ];

    result[month] =
      (result[month] || 0) +
      Number(transaction.amount);

    return result;
  }, {});

  if (loading) {
    return (
      <div className="dashboard-loading">
        Завантаження...
      </div>
    );
  }

  return (
    <main className="dashboard-page">

      <div className="dashboard-container">


        <div className="dashboard-top">

          <div className="balance-block">

            <span className="balance-label">
              Баланс:
            </span>

            <div className="balance-input-wrapper">

              <input
                className="balance-input"
                type="number"
                value={balanceInput}
                onChange={(e) =>
                  setBalanceInput(e.target.value)
                }
              />

              <span className="balance-currency">
                {currency}
              </span>

            </div>

            <button
              className="confirm-balance"
              onClick={saveBalance}
            >
              ПІДТВЕРДИТИ
            </button>

          </div>


        <Link
  to="/calculations"
  className="calculations-link"
>
  <span>Перейти до розрахунків</span>

</Link>
            <div className="mini-chart">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>

        </div>

        {balance === 0 && (
          <div className="balance-tooltip">
            <div className="tooltip-arrow"></div>

            <b>Привіт!</b> Для початку роботи
            <br />
            внесіть свій поточний баланс
            <br />
            рахунку!
            <br />

            <small>
              Ви не можете витрачати гроші,
              поки їх у Вас немає :)
            </small>
          </div>
        )}


        <div className="tabs">

          <button
            className={
              activeTab === 'expense'
                ? 'tab active'
                : 'tab'
            }
            onClick={() => {
              setActiveTab('expense');
              clearInputs();
            }}
          >
            ВИТРАТИ
          </button>

          <button
            className={
              activeTab === 'income'
                ? 'tab active'
                : 'tab'
            }
            onClick={() => {
              setActiveTab('income');
              clearInputs();
            }}
          >
            ДОХІД
          </button>

        </div>


        <div className="finance-card">


          <div className="transaction-form">

          <div className="transaction-date">
  <img
    className="calendar-img"
    src="/svg/calendar.png"
    alt="calendar"
  />

  <span>
    {new Date().toLocaleDateString('uk-UA')}
  </span>
</div>


            <input
              className="description-input"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder={
                activeTab === 'expense'
                  ? 'Опис товару'
                  : 'Опис прибутку'
              }
            />


            <div className="category-select">

              <button
                type="button"
                className="category-button"
                onClick={() =>
                  setCategoryOpen(
                    !categoryOpen
                  )
                }
              >
                <span>
                  {category ||
                    (activeTab === 'expense'
                      ? 'Категорія товару'
                      : 'Категорія прибутку')}
                </span>

                <span>
                  {categoryOpen ? '⌃' : '⌄'}
                </span>
              </button>


              {categoryOpen && (
                <div className="category-dropdown">

                  {categories.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setCategory(item);
                        setCategoryOpen(false);
                      }}
                    >
                      {item}
                    </button>
                  ))}

                </div>
              )}

            </div>


            <div className="amount-wrapper">

              <input
                className="amount-input"
                type="number"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
                placeholder="0,00"
              />

             <img
  className="calculator-icon"
  src="/svg/calculator.png"
  alt="calculator"
/>

            </div>


            <button
              className="add-button"
              onClick={addTransaction}
            >
              ВНЕСТИ
            </button>


            <button
              className="clear-button"
              onClick={clearInputs}
            >
              ОЧИСТИТИ
            </button>

          </div>


          <div className="finance-content">

            <div className="transactions-table">

              <div className="table-header">
                <span>ДАТА</span>
                <span>ОПИС</span>
                <span>КАТЕГОРІЯ</span>
                <span>СУМА</span>
                <span></span>
              </div>


              {visibleTransactions.map(
                (transaction) => (
                  <div
                    className="table-row"
                    key={transaction.id}
                  >

                    <span>
                      {formatDate(
                        transaction.date
                      )}
                    </span>

                    <span>
                      {transaction.description}
                    </span>

                    <span>
                      {transaction.category}
                    </span>

                    <span
                      className={
                        transaction.type ===
                        'expense'
                          ? 'expense-money'
                          : 'income-money'
                      }
                    >
                      {transaction.type ===
                      'expense'
                        ? '- '
                        : '+ '}

                      {Number(
                        transaction.amount
                      ).toLocaleString(
                        'uk-UA',
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}

                      {' грн.'}
                    </span>


                   <button
  className="delete-button"
  onClick={() =>
    deleteTransaction(transaction)
  }
>
  <img
    src="/svg/Vector.png"
    alt="delete"
  />
</button>

                  </div>
                )
              )}


              <div className="empty-table-lines">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>

              <div className="orange-scroll"></div>

            </div>


            <div className="summary">

              <div className="summary-title">
                ЗВЕДЕННЯ
              </div>

              {Object.entries(summary)
                .reverse()
                .slice(0, 6)
                .map(([month, value]) => (
                  <div
                    className="summary-row"
                    key={month}
                  >
                    <span>
                      {month}
                    </span>

                    <span>
                      {value.toLocaleString(
                        'uk-UA',
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </span>
                  </div>
                ))}

            </div>

          </div>

        </div>

    </main>
  );
};