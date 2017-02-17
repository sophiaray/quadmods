import scikits.bootstrap as bootstrap
from scipy import stats
import matplotlib.pyplot as plt
import numpy

def t_test_text_1samp(x, popmean=0):
    t_test_res = stats.ttest_1samp(x,popmean)
    return "(M = {0:.4f}, SD = {1:.4f}), t({2}) = {3:.4f}, p = {4:.4f}".format(
            x.mean(),
            x.std(), 
            len(x)-1, 
            t_test_res[0],
            t_test_res[1])
    
def t_test_text_2samp(x1,x2,equal_var=False):
    t_test_res = stats.ttest_ind(x1,x2,equal_var=equal_var)
    
    if equal_var:
        std = numpy.std(numpy.concatenate((x1,x2)))
    else:
        n1 = x1.count(); s1 = x1.std(); n2 = x2.count(); s2 = x2.std()
        std = (n1-1)*s1**2 + (n2-1)*s2**2
        std /= (n1 + n2 - 2)
        std **= .5
    
    d = abs(x1.mean() - x2.mean())/std
    
    return "x1 (M = {0:.4f}, SD = {1:.4f}), x2 (M = {2:.4f}, SD = {3:.4f}); t({4}) = {5:.4f}, p = {6:.4f}, d={7:.4f}".format(
            x1.mean(),
            x1.std(),
            x2.mean(),
            x2.std(),
            len(x1) + len(x2) - 2, 
            t_test_res[0],
            t_test_res[1],
            d)
    
def boot(x):
    x = x.as_matrix()
    return bootstrap.ci(x)

def plot_by_two(x,y,data,offset=.1):
    grouped_data = data.groupby(x)[y]


    y = grouped_data.mean()
    y1 = y[1::2]; y2 = y[::2]

    ci = grouped_data.apply(boot)
    ci = numpy.array([list(item) for item in ci])
    ci = abs(ci - y.as_matrix()[:,None])
    ci1 = ci[1::2]; ci2 = ci[::2]
    x1 = numpy.arange(len(y1))
    x2 = x1+offset

    x_text = y.index.levels[0]

    plt.errorbar(x=x1, y=y1, yerr=ci1.T, fmt='.', color="black", label=y.index.levels[1][1])
    plt.errorbar(x=x2, y=y2, yerr=ci2.T, fmt='.', color="red", label=y.index.levels[1][0])

    plt.xticks(x1,x_text, rotation=90)

    plt.legend()
    
def plot_by_one(x,y,data,offset=.1):
    grouped_data = data.groupby(x)[y]


    y = grouped_data.mean()

    ci = grouped_data.apply(boot)
    ci = numpy.array([list(item) for item in ci])
    ci = abs(ci - y.as_matrix()[:,None])
    x = numpy.arange(len(y))

    x_text = y.index

    plt.errorbar(x=x, y=y, yerr=ci.T, fmt='.', color="black")

    plt.xticks(x,x_text, rotation=90)

    plt.legend()